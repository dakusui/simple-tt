A package to hold utility classes to implement best practices for dependencies.
Potentially, they should be included not by this product, but by those dependency libraries.

For instances, under `valid8j.web`, there are classes named `PageTransformer`.
It is a useful class to interact with playwright's `Page` object through **valid8j** library, while it is abstract enough to be transparent to our product's (that is, **simple-tt** 's) specification.
Ideally and potentially, such classes should be not a part of simple-tt, but of valid8j.
