export declare type TransformToken = 'identity' | 'uncap' | 'lower' | 'upper' | 'cap';

export declare type TransformApplyOne<S extends string, T extends TransformToken> = T extends 'uncap'
    ? Uncapitalize<S>
    : T extends 'lower'
      ? Lowercase<S>
      : T extends 'upper'
        ? Uppercase<S>
        : T extends 'cap'
          ? Capitalize<S>
          : /* identity */ S;

export declare type TransformApplyPipe<S extends string, P extends readonly TransformToken[]> = P extends readonly [
    infer H,
    ...infer R,
]
    ? H extends TransformToken
        ? R extends readonly TransformToken[]
            ? TransformApplyPipe<TransformApplyOne<S, H>, R>
            : TransformApplyOne<S, H>
        : S
    : S;

export declare type TransformApply<
    S extends string,
    T extends TransformToken | readonly TransformToken[],
> = T extends readonly TransformToken[] ? TransformApplyPipe<S, T> : TransformApplyOne<S, T>;
