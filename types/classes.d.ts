import type { Ctor, InstanceMethodKeysOf, SafeCtor, StaticMethodKeysOf } from '+types/lang';
import type { TransformApply, TransformToken } from '+types/transform';

export declare type PrefixedKeys<M, P extends string = ''> = Extract<keyof M, `${P}${string}`>;

// Operation: Extract normalized exported constructor/class names
export declare type CtorNameKeyMap<
    M,
    P extends string = '',
    T extends TransformToken | readonly TransformToken[] = 'identity',
> = {
    [K in PrefixedKeys<M, P>]: M[K] extends Ctor
        ? K extends `${P}${infer Rest}`
            ? TransformApply<Rest, T>
            : never
        : never;
}[PrefixedKeys<M, P>];

// Reverse operation: Transform normalized export name/key to original export name
export declare type CtorNameFromKey<
    M,
    S extends CtorNameKeyMap<M, P, T>,
    P extends string = '',
    T extends TransformToken | readonly TransformToken[] = 'identity',
> = {
    [K in PrefixedKeys<M, P>]: M[K] extends Ctor
        ? K extends `${P}${infer Rest}`
            ? TransformApply<Rest, T> extends S
                ? K
                : never
            : never
        : never;
}[PrefixedKeys<M, P>];

// Reverse operation: Transform normalized export name/key to original constructor/class export
export declare type CtorFromKey<
    M,
    S extends CtorNameKeyMap<M, P, T>,
    P extends string = '',
    T extends TransformToken | readonly TransformToken[] = 'identity',
> = SafeCtor<M[CtorNameFromKey<M, S, P, T>]>;

// Reverse operation: Transform normalized export name/key to exported instance methods of the
// original constructor/class
export declare type InstanceMethodsFromKey<
    M,
    P extends string = '',
    T extends TransformToken | readonly TransformToken[] = 'identity',
> = {
    [S in keyof CtorFromKey<M, S, P, T> & string]: InstanceMethodKeysOf<CtorFromKey<M, S, P, T>[S]>;
};

// Reverse operation: Transform normalized export name/key to exported static methods of the
// original constructor/class
export declare type StaticMethodsFromKey<
    M,
    P extends string = '',
    T extends TransformToken | readonly TransformToken[] = 'identity',
> = {
    [S in keyof CtorFromKey<M, S, P, T> & string]: StaticMethodKeysOf<CtorFromKey<M, S, P, T>[S]>;
};
