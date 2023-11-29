export function HideLoader(triggerAction: string) {
  // tslint:disable-next-line
  return (Class: Function) => {
    Object.defineProperty(Class.prototype, 'triggerAction', {
      value: triggerAction
    });
  };
}
