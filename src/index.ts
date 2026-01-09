// Wrapper TS gerado a partir do bundle publicado.
// O pacote oficial não inclui o código-fonte original, apenas dist.
// Mantemos o build apontando para os bundles compat (ES/UMD) já vendorizados.

export * from "../dist/index.es.js";
export type * from "../dist/index.d.ts";
// Fonte TypeScript gerada a partir do bundle distribuído.
// O pacote publicado no npm não inclui o código-fonte original,
// então reexportamos o bundle ES para permitir builds locais
// sem perder o comportamento do UMD/ES já compatível com Webpack 4.

export * from "../dist/index.es.js";
export type * from "../dist/index.d.ts";
