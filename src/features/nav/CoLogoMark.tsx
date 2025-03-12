import { ThemeContext } from 'features/theming/ThemeProvider';

import { CSS } from '../../stitches.config';
import { Box, Flex, Link } from '../../ui';
import { COORDINAPE_MARKETING_URL } from 'config/webAppURL';

export const CoLogoMark = ({
  css,
  forceTheme,
  muted,
  small,
  mark,
}: {
  css?: CSS;
  forceTheme?: string;
  muted?: boolean;
  small?: boolean;
  mark?: boolean;
}) => {
  return (
    <ThemeContext.Consumer>
      {({ theme }) => (
        <Flex column>
          <Box
            as={Link}
            href={COORDINAPE_MARKETING_URL}
            target="_blank"
            rel="noreferrer"
            css={{
              'img, svg': {
                width: '200px',
                minWidth: '140px',
                '@lg': {
                  width: '150px',
                },
                '@sm': {
                  width: '140px',
                },
              },
              'svg *': { fill: 'white' },
              cursor: 'pointer',
              ...(mark && {
                img: {
                  height: '46px',
                  width: 'auto',
                  minWidth: 0,
                },
              }),
              ...(small && {
                img: {
                  height: '20px',
                  width: 'auto',
                  minWidth: 0,
                },
              }),
              ...css,
            }}
          >
            <>
              {mark ? (
                <img
                  src={
                    theme == 'dark' ||
                    forceTheme == 'dark' ||
                    theme == 'party' ||
                    forceTheme == 'party'
                      ? '/imgs/logo/orcanize-mark-black.png'
                      : '/imgs/logo/orcanize-mark-black.png'
                  }
                  alt="orcanize logo"
                />
              ) : (
                <img
                  src={
                    muted
                      ? '/imgs/logo/orcanize-logo-black.png'
                      : theme == 'dark' ||
                          forceTheme == 'dark' ||
                          theme == 'party' ||
                          forceTheme == 'party'
                        ? '/imgs/logo/orcanize-logo-white.png'
                        : '/imgs/logo/orcanize-logo-black.png'
                  }
                  alt="orcanize logo"
                />
              )}
            </>
          </Box>
        </Flex>
      )}
    </ThemeContext.Consumer>
  );
};
