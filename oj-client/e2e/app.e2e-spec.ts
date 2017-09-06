import { OjClientZyPage } from './app.po';

describe('oj-client-zy App', () => {
  let page: OjClientZyPage;

  beforeEach(() => {
    page = new OjClientZyPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
