interface RenderEmailTemplateOptions {
    previewText: string;
    heading: string;
    paragraphs: string[];
    ctaLabel: string;
    ctaUrl: string;
    footerNote: string;
}

export const renderEmailTemplate = ({
    previewText,
    heading,
    paragraphs,
    ctaLabel,
    ctaUrl,
    footerNote,
}: RenderEmailTemplateOptions) => {
    const paragraphsHtml = paragraphs
        .map(
            (paragraph) =>
                `<p style="margin:0 0 16px 0; font-size:15px; line-height:1.6; color:#3f3f46;">${paragraph}</p>`,
        )
        .join("");

    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px 32px; text-align:center; border-bottom:1px solid #eeeeee;">
                <span style="font-size:22px; font-weight:700; color:#191919;">easy<span style="color:#5a7b00;">plit</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px 0; font-size:20px; font-weight:700; color:#191919;">${heading}</h1>
                ${paragraphsHtml}
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
                  <tr>
                    <td style="background-color:#5a7b00;">
                      <a href="${ctaUrl}" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0; font-size:13px; line-height:1.6; color:#71717a;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br /><a href="${ctaUrl}" style="color:#5a7b00; word-break:break-all;">${ctaUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:#fafafa; text-align:center;">
                <p style="margin:0; font-size:12px; color:#a1a1aa;">${footerNote}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const text = [
        heading,
        "",
        ...paragraphs.map((paragraph) => paragraph.replace(/<[^>]+>/g, "")),
        "",
        `${ctaLabel}: ${ctaUrl}`,
        "",
        footerNote,
    ].join("\n");

    return { html, text };
};
