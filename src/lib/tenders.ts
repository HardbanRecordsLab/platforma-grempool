const PROVINCES = ["PL02", "PL08"] as const; // dolnośląskie, lubuskie
const KEYWORDS = [
  "złom",
  "złomu",
  "złomowan",
  "rozbiór",
  "rozbiork",
  "wyburz",
  "demont",
  "odpad",
  "wywóz",
  "wywoz",
  "gruz",
  "kruszyw",
  "utylizacj",
  "recykling",
];

interface RawNotice {
  noticeNumber: string;
  bzpNumber: string;
  publicationDate: string;
  orderObject: string;
  cpvCode: string;
  submittingOffersDate: string | null;
  organizationName: string;
  organizationCity: string;
  organizationProvince: string;
  tenderId: string;
}

export interface TenderMatch {
  id: string;
  tytul: string;
  organizacja: string;
  miasto: string;
  wojewodztwo: string;
  dataPublikacji: string;
  terminOfert: string | null;
  url: string;
}

const PROVINCE_LABELS: Record<string, string> = { PL02: "dolnośląskie", PL08: "lubuskie" };

async function fetchProvinceNotices(province: string, days: number): Promise<RawNotice[]> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    PublicationDateFrom: from.toISOString().slice(0, 10),
    PublicationDateTo: to.toISOString().slice(0, 10),
    NoticeType: "ContractNotice",
    OrganizationProvince: province,
    PageSize: "500",
  });
  const res = await fetch(`https://ezamowienia.gov.pl/mo-board/api/v1/notice?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

function isRelevant(notice: RawNotice): boolean {
  const title = notice.orderObject.toLowerCase();
  return KEYWORDS.some((kw) => title.includes(kw));
}

export async function getRelevantTenders(days = 14): Promise<TenderMatch[]> {
  const results = await Promise.all(PROVINCES.map((p) => fetchProvinceNotices(p, days)));
  const all = results.flat();
  const relevant = all.filter(isRelevant);

  const seen = new Set<string>();
  const deduped = relevant.filter((n) => {
    if (seen.has(n.tenderId)) return false;
    seen.add(n.tenderId);
    return true;
  });

  return deduped
    .map((n) => ({
      id: n.tenderId,
      tytul: n.orderObject,
      organizacja: n.organizationName,
      miasto: n.organizationCity,
      wojewodztwo: PROVINCE_LABELS[n.organizationProvince] ?? n.organizationProvince,
      dataPublikacji: n.publicationDate,
      terminOfert: n.submittingOffersDate,
      url: `https://ezamowienia.gov.pl/mp-client/tenders/${n.tenderId}`,
    }))
    .sort((a, b) => b.dataPublikacji.localeCompare(a.dataPublikacji));
}
