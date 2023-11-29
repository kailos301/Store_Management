export function ShowLoader() {
  // tslint:disable-next-line
  return (Class: Function) => {
    Object.defineProperty(Class.prototype, 'showLoader', {
      value: true
    });
  };
}
