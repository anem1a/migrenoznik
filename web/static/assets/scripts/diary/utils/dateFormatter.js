export class DateFormatter {
  static formatDateTime(date, calendar) {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = calendar.month_number_to_name(d.getMonth());
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd} ${mm} ${yyyy} ${hh}:${min}`;
  }
}
