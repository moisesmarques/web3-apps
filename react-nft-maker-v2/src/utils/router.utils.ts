enum Page {
  HOME,
  DASHBOARD,
  NFT_DETAILS,
}

const ROUTES = {
  [Page.HOME]: () => '/all-nfts',
  [Page.DASHBOARD]: () => '/dashboard',
  [Page.NFT_DETAILS]: ({ id }: { id: string }) => `/nft/${id}`,
};

const route = (page: Page, args?: any): string => {
  return ROUTES[page](args);
};

export const nftDetailsPage = (id: string) => route(Page.NFT_DETAILS, { id });
export const homePage = () => route(Page.HOME);
