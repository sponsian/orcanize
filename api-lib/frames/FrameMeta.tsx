import React from 'react';

import { VercelResponse } from '@vercel/node';
import { renderToString } from 'react-dom/server';

import { Frame } from '../../_api/frames/router.tsx';

import { FramePostInfo } from './_getFramePostInfo.tsx';
import { FrameButton } from './FrameButton.tsx';
import { getPostUrl, getImgSrc } from './routingUrls.ts';

export const RenderFrameMeta = ({
  frame,
  res,
  params,
  info,
}: {
  frame: Frame;
  res: VercelResponse;
  params: Record<string, string>;
  info?: FramePostInfo;
}) => {
  const imgSrc = getImgSrc(frame, params, info);
  const postURL = getPostUrl(frame, params);
  const buttons = frame.buttons;

  const content: React.JSX.Element = (
    <html lang="en">
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:post_url" content={postURL} />
        {/*{state && <meta property="fc:frame:state" content={state} />}*/}
        {buttons.map((button, idx) => (
          <FrameButton
            key={idx}
            idx={idx + 1}
            title={button.title}
            action={button.action}
            target={button.target}
          />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imgSrc} />
        <meta property="og:image" content={imgSrc} />
        <meta property="fc:frame:image" content={imgSrc} />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />
        <title>Farcaster Frame</title>
      </head>
      <body>
        <h1>This is just a frame yall</h1>
      </body>
    </html>
  );
  const sString = renderToString(content);
  return res.status(200).send(sString);
};