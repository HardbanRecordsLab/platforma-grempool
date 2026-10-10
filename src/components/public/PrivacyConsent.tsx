import { PRIVACY_POLICY_PATH } from "@/lib/privacy";

// Required checkbox under the public forms. The link opens in a new tab so
// the visitor does not lose what they have typed.
export default function PrivacyConsent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="mb-6">
      <label className="flex items-start gap-3 cursor-pointer text-sm text-[#e8dfcc] leading-relaxed">
        <input
          type="checkbox"
          required
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[#f5b52c]"
        />
        <span>
          Zapoznałem(-am) się z{" "}
          <a
            href={PRIVACY_POLICY_PATH}
            target="_blank"
            rel="noopener"
            className="text-[#f5b52c] underline underline-offset-2 hover:text-white"
          >
            Polityką prywatności
          </a>{" "}
          i wiem, że administratorem moich danych jest GREMPOOL Maria Muczyńska, a podane dane posłużą do odpowiedzi na to
          zapytanie. *
        </span>
      </label>
    </div>
  );
}
