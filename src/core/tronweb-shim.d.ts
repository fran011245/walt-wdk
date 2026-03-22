/**
 * TronWeb ships without complete TypeScript declarations for all entry points.
 */
declare module 'tronweb' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TronWeb: any;
  export default TronWeb;
}
