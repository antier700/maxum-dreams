// This component injects a blocking script to prevent FOUC (Flash of Unstyled Content)
// It runs before React hydrates, setting the theme immediately

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              document.documentElement.setAttribute('data-theme', 'dark');
            } catch (e) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `,
      }}
    />
  );
}
