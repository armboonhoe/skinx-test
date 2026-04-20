import { describe, expect, it } from 'vitest';
import { createPost, createUser } from './helpers/factories';
import { authHeader, http, login } from './helpers/request';

const loggedInUser = async () => {
  const user = await createUser();
  const token = await login(user.email, user.plainPassword);
  return { user, token };
};

describe('GET /api/posts', () => {
  it('requires authentication', async () => {
    const res = await http().get('/api/posts');
    expect(res.status).toBe(401);
  });

  it('returns paginated posts sorted by postedAt desc', async () => {
    const { token } = await loggedInUser();

    // Create 3 posts with distinct timestamps
    await createPost({ title: 'Oldest' });
    await new Promise((r) => setTimeout(r, 10));
    await createPost({ title: 'Middle' });
    await new Promise((r) => setTimeout(r, 10));
    await createPost({ title: 'Newest' });

    const res = await http().get('/api/posts').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.items.map((p: { title: string }) => p.title)).toEqual([
      'Newest',
      'Middle',
      'Oldest',
    ]);
  });

  it('paginates with page/pageSize and reports totalPages', async () => {
    const { token } = await loggedInUser();
    for (let i = 0; i < 5; i++) {
      await createPost({ title: `Post ${i}` });
    }

    const page1 = await http()
      .get('/api/posts?page=1&pageSize=2')
      .set(authHeader(token))
      .expect(200);
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.total).toBe(5);
    expect(page1.body.totalPages).toBe(3);

    const page3 = await http()
      .get('/api/posts?page=3&pageSize=2')
      .set(authHeader(token))
      .expect(200);
    expect(page3.body.items).toHaveLength(1);
  });

  it('filters by tag', async () => {
    const { token } = await loggedInUser();
    await createPost({ title: 'A', tags: ['foo', 'bar'] });
    await createPost({ title: 'B', tags: ['foo'] });
    await createPost({ title: 'C', tags: ['baz'] });

    const res = await http().get('/api/posts?tag=foo').set(authHeader(token)).expect(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items.map((p: { title: string }) => p.title).sort()).toEqual(['A', 'B']);
  });

  it('filters by title with case-insensitive search (q)', async () => {
    const { token } = await loggedInUser();
    await createPost({ title: 'Fascinating Finding' });
    await createPost({ title: 'another post' });

    const res = await http().get('/api/posts?q=FASCINATING').set(authHeader(token)).expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toBe('Fascinating Finding');
  });

  it('rejects pageSize > 100', async () => {
    const { token } = await loggedInUser();
    const res = await http().get('/api/posts?pageSize=101').set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('does not leak content field in list response', async () => {
    const { token } = await loggedInUser();
    await createPost({ title: 'T', content: '<p>SECRET</p>' });

    const res = await http().get('/api/posts').set(authHeader(token)).expect(200);
    expect(res.body.items[0]).not.toHaveProperty('content');
  });
});

describe('GET /api/posts/:id', () => {
  it('returns full post with content', async () => {
    const { token } = await loggedInUser();
    const post = await createPost({ title: 'Detail', content: '<p>body</p>', tags: ['x'] });

    const res = await http().get(`/api/posts/${post.id}`).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.post).toMatchObject({
      id: post.id,
      title: 'Detail',
      content: '<p>body</p>',
      tags: ['x'],
    });
  });

  it('returns 404 for unknown id', async () => {
    const { token } = await loggedInUser();
    const res = await http().get('/api/posts/nonexistent-id').set(authHeader(token));
    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const post = await createPost();
    const res = await http().get(`/api/posts/${post.id}`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/posts/tags', () => {
  it('returns all tags with post counts sorted alphabetically', async () => {
    const { token } = await loggedInUser();
    await createPost({ tags: ['zebra'] });
    await createPost({ tags: ['alpha', 'zebra'] });
    await createPost({ tags: ['alpha'] });

    const res = await http().get('/api/posts/tags').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual([
      { name: 'alpha', count: 2 },
      { name: 'zebra', count: 2 },
    ]);
  });

  it('requires authentication', async () => {
    const res = await http().get('/api/posts/tags');
    expect(res.status).toBe(401);
  });
});
