import { isDefined, type Nullable } from '@game/shared';

export function waitForElement(selector: string, timeout?: number) {
  return new Promise<Nullable<HTMLElement>>(resolve => {
    const observer = new MutationObserver((mutations, observer) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element as HTMLElement);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    if (isDefined(timeout)) {
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    }
  });
}
