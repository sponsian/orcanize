import React from 'react';

import { IN_DEVELOPMENT } from '../../../src/config/env';

export const OgPostImage = ({
  description,
  name,
  avatar,
  links,
  rep,
  scale,
}: {
  description: string;
  name: string;
  avatar?: string;
  links: number;
  rep: number;
  scale: number;
}) => {
  const DEFAULT_AVATAR =
    'https://coordinape-prod.s3.amazonaws.com/default_profile.jpg';

  function abbreviateNumber(num: number): string {
    if (num < 1000) {
      return num.toString();
    } else if (num < 10000) {
      // Convert to thousands with one decimal place
      let abbreviated = (num / 1000).toFixed(1);
      abbreviated = abbreviated.replace(/\.0$/, '');
      return abbreviated + 'k';
    } else {
      // For 10000 and above, round down to the nearest thousand
      return Math.floor(num / 1000) + 'k';
    }
  }
  const svgSize = 23 * scale;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(0,0,0,0.6), transparent 65%), linear-gradient(20deg, #602dcb 0%, #00d94d 100%)`,
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        padding: 20 * scale,
        aspectRatio: '2/1',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            borderBottom: '1px solid rgba(255,255,255,0.6)',
            paddingBottom: 12 * scale,
            marginBottom: 15 * scale,
            flexWrap: 'wrap',
            gap: 11 * scale,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <img
              alt="avatar"
              src={
                avatar
                  ? IN_DEVELOPMENT
                    ? avatar
                    : process.env.VITE_S3_BASE_URL + avatar
                  : DEFAULT_AVATAR
              }
              style={{ margin: '0', borderRadius: 99999 }}
              height={50 * scale}
              width={50 * scale}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 15 * scale,
                marginLeft: 12 * scale,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 35 * scale,
                  fontFamily: 'Denim, sans-serif',
                  color: '#fcfcfc',
                }}
              >
                {name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10 * scale,
                  marginBottom: -4 * scale,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6 * scale,
                  }}
                >
                  <svg width={svgSize} height={svgSize} viewBox="0 0 24 24">
                    <g
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <g
                        transform="translate(2.000000, 2.000000)"
                        fill="#FFFFFF"
                        fillRule="nonzero"
                      >
                        <path
                          d="M7.73869846,3.26775956 C7.50024839,3.50620964 7.17834078,3.64133135 6.84053651,3.64133135 L4.27719821,3.64133135 C3.92747144,3.64133135 3.64133135,3.92747144 3.64133135,4.27719821 L3.64133135,6.84053651 C3.64133135,7.17834078 3.50620964,7.50024839 3.26775956,7.73869846 L1.455539,9.55091903 C1.20914059,9.79731744 1.20914059,10.2026826 1.455539,10.449081 L0.557377049,11.3472429 C-0.18579235,10.6040735 -0.18579235,9.39592648 0.557377049,8.64878291 L2.36959762,6.84053651 L2.36959762,4.27719821 C2.36959762,3.22404372 3.22404372,2.36959762 4.27719821,2.36959762 L6.84053651,2.36959762 L8.65275708,0.557377049 C9.39592648,-0.18579235 10.6040735,-0.18579235 11.3512171,0.557377049 L13.1594635,2.36959762 L15.7228018,2.36959762 C16.7759563,2.36959762 17.6304024,3.22404372 17.6304024,4.27719821 L17.6304024,6.84053651 L19.442623,8.65275708 C20.1857923,9.39592648 20.1857923,10.6040735 19.442623,11.3512171 L17.6304024,13.1594635 L17.6304024,15.7228018 C17.6304024,16.7759563 16.7759563,17.6304024 15.7228018,17.6304024 L13.1594635,17.6304024 L11.3472429,19.442623 C10.6040735,20.1857923 9.39592648,20.1857923 8.64878291,19.442623 L6.84053651,17.6304024 L4.27719821,17.6304024 C3.22404372,17.6304024 2.36959762,16.7759563 2.36959762,15.7228018 L2.36959762,13.1594635 L0.557377049,11.3472429 L1.455539,10.449081 L3.26775956,12.2613015 C3.50620964,12.4997516 3.64133135,12.8216592 3.64133135,13.1594635 L3.64133135,15.7228018 C3.64133135,16.0725286 3.92747144,16.3586687 4.27719821,16.3586687 L6.84053651,16.3586687 C7.17834078,16.3586687 7.50024839,16.4937904 7.73869846,16.7322404 L9.55091903,18.544461 C9.79731744,18.7908594 10.2026826,18.7908594 10.449081,18.544461 L12.2613015,16.7322404 C12.4997516,16.4937904 12.8216592,16.3586687 13.1594635,16.3586687 L15.7228018,16.3586687 C16.0725286,16.3586687 16.3586687,16.0725286 16.3586687,15.7228018 L16.3586687,13.1594635 C16.3586687,12.8216592 16.4937904,12.4997516 16.7322404,12.2613015 L18.544461,10.449081 C18.7908594,10.2026826 18.7908594,9.79731744 18.544461,9.55091903 L16.7322404,7.73869846 C16.4937904,7.50024839 16.3586687,7.17834078 16.3586687,6.84053651 L16.3586687,4.27719821 C16.3586687,3.92747144 16.0725286,3.64133135 15.7228018,3.64133135 L13.1594635,3.64133135 C12.8216592,3.64133135 12.4997516,3.50620964 12.2613015,3.26775956 L10.449081,1.455539 C10.2026826,1.20914059 9.79731744,1.20914059 9.55091903,1.455539 L7.73869846,3.26775956 Z"
                          id="Path"
                        ></path>
                      </g>
                    </g>
                  </svg>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 15 * scale,
                      fontFamily: 'Denim, sans-serif',
                      color: '#fcfcfc',
                    }}
                  >
                    {abbreviateNumber(rep)} Rep
                  </h2>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <svg
                    width={svgSize}
                    height={svgSize}
                    viewBox="0 0 24 24"
                    version="1.1"
                  >
                    <g
                      stroke="none"
                      strokeWidth="1"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <g
                        transform="translate(0.500000, 3.000000)"
                        fill="#FCFCFC"
                        fillRule="nonzero"
                      >
                        <path
                          d="M8.3375,14.6179688 C7.431875,13.3453125 6.9,11.7949219 6.9,10.125 C6.9,6.64101563 9.21078125,3.68789063 12.4164062,2.64726563 C11.226875,1.69453125 9.70671875,1.125 8.05,1.125 C4.240625,1.125 1.15,4.1484375 1.15,7.875 C1.15,11.6015625 4.240625,14.625 8.05,14.625 C8.14703125,14.625 8.2440625,14.6214844 8.3375,14.6179688 Z M9.645625,14.4421875 C12.6859375,13.7390625 14.95,11.0636719 14.95,7.875 C14.95,6.23320313 14.3498437,4.72851562 13.354375,3.5578125 C10.3140625,4.2609375 8.05,6.93632812 8.05,10.125 C8.05,11.7667969 8.65015625,13.2714844 9.645625,14.4421875 Z M9.22875,15.665625 C8.84421875,15.721875 8.44890625,15.75 8.05,15.75 C3.60453125,15.75 0,12.2238281 0,7.875 C0,3.52617188 3.60453125,0 8.05,0 C10.2889063,0 12.3121875,0.89296875 13.77125,2.334375 C14.1557813,2.278125 14.5475,2.25 14.95,2.25 C19.3954688,2.25 23,5.77617188 23,10.125 C23,14.4738281 19.3954688,18 14.95,18 C12.7110937,18 10.6878125,17.1070313 9.22875,15.665625 Z M14.6625,3.38203125 C15.568125,4.65820312 16.1,6.20507812 16.1,7.875 C16.1,11.3589844 13.7892187,14.3121094 10.5835937,15.3527344 C11.773125,16.3054688 13.2932812,16.875 14.95,16.875 C18.759375,16.875 21.85,13.8515625 21.85,10.125 C21.85,6.3984375 18.759375,3.375 14.95,3.375 C14.8529687,3.375 14.7559375,3.37851562 14.6625,3.38203125 Z"
                          id="Shape"
                        ></path>
                      </g>
                    </g>
                  </svg>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 15 * scale,
                      fontFamily: 'Denim, sans-serif',
                      color: '#fcfcfc',
                    }}
                  >
                    {abbreviateNumber(links)} Links
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <img
            style={{ height: 50 * scale }}
            src={
              'https://colinks.orcanize.app/imgs/logo/colinks-logo-grey1.png'
            }
            alt="colinks logo"
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            textAlign: 'left',
            width: '100%',
            fontSize: 20 * scale,
            lineHeight: 1.3,
            color: '#fcfcfc',
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
