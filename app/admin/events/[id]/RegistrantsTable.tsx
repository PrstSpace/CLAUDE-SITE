import { resendTicketEmailAction } from "./actions";

type Registrant = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  status: "REGISTERED" | "CHECKED_IN";
  emailSentAt: Date | null;
  emailError: string | null;
  checkedInAt: Date | null;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export default function RegistrantsTable({ registrants }: { registrants: Registrant[] }) {
  if (registrants.length === 0) {
    return <p className="text-neutral-500">Пока никто не зарегистрировался.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500">
          <tr>
            <th className="px-3 py-2 font-medium">ФИО</th>
            <th className="px-3 py-2 font-medium">Контакты</th>
            <th className="px-3 py-2 font-medium">Компания</th>
            <th className="px-3 py-2 font-medium">Билет</th>
            <th className="px-3 py-2 font-medium">Вход</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {registrants.map((r) => (
            <tr key={r.id} className="border-t border-neutral-100 align-top">
              <td className="px-3 py-2 font-medium text-neutral-900">{r.fullName}</td>
              <td className="px-3 py-2 text-neutral-700">
                <div>{r.phone}</div>
                <div className="text-neutral-500">{r.email}</div>
              </td>
              <td className="px-3 py-2 text-neutral-700">
                <div>{r.company}</div>
                <div className="text-neutral-500">{r.position}</div>
              </td>
              <td className="px-3 py-2">
                {r.emailError ? (
                  <span className="text-red-600" title={r.emailError}>
                    Ошибка отправки
                  </span>
                ) : r.emailSentAt ? (
                  <span className="text-green-700">Отправлен</span>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                {r.status === "CHECKED_IN" && r.checkedInAt ? (
                  <span className="text-green-700">{formatDateTime(r.checkedInAt)}</span>
                ) : (
                  <span className="text-neutral-500">Ещё нет</span>
                )}
              </td>
              <td className="px-3 py-2 text-right">
                <form action={resendTicketEmailAction.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
                  >
                    Отправить билет повторно
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
