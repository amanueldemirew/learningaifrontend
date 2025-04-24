declare module "gray-matter" {
  interface GrayMatterResult {
    data: { [key: string]: unknown };
    content: string;
  }

  function matter(content: string): GrayMatterResult;
  export default matter;
}
