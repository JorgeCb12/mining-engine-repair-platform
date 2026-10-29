export const formatLocalDate = (dateString: string) => {
  if (!dateString) return "—";

  // Datetimes from existing timezone-naive columns represent UTC.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateString);
  const date = new Date(hasTimezone ? dateString : `${dateString}Z`);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
};
