const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});

export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso));
