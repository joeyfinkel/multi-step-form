function lazy(strings: TemplateStringsArray, ...values: any[]) {
  return () => String.raw({ raw: strings }, ...values);
}

export function invariant<T>(
  condition: T,
  message: string | ((formatter: Intl.ListFormat) => string),
  error: new (message: string) => Error = Error
): asserts condition {
  if (!condition) {
    const formatter = new Intl.ListFormat('en', {
      style: 'long',
      type: 'conjunction',
    });
    const resolvedMessage =
      typeof message === 'function' ? message(formatter) : lazy`${message}`();

    throw new error(resolvedMessage);
  }
}
