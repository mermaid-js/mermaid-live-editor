/**
 * Serializes an SVG element into markup that parses as XML, so it can be loaded as an
 * `image/svg+xml` image or saved as a standalone `.svg` file.
 *
 * `outerHTML` uses HTML serialization rules, which emit void elements without a closing slash
 * and escape non-breaking spaces as `&nbsp;`, an entity that XML does not define.
 */
export const serializeSvg = (svg: Element): string =>
  svg.outerHTML
    .replaceAll('<br>', '<br/>')
    .replaceAll(/<img([^>]*)>/g, (m, g: string) => `<img ${g} />`)
    .replaceAll('&nbsp;', '&#160;');
