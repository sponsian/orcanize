import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import React from 'react';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ImageResponse } from '@vercel/og';

import { getProfileInfo } from '../getProfileInfo.ts';
import { OGAvatar } from '../OGAvatar.tsx';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let urlPath = req.url as string;
    if (!urlPath.startsWith('http')) {
      urlPath = `https://www.fake.app${urlPath}`;
    }
    const originalUrl = new URL(urlPath);

    const parts = originalUrl.pathname.split('/');
    const address = parts[parts.length - 1] ?? 'IDK';

    const profile = await getProfileInfo(address);

    if (!profile) {
      return res.status(404).send({
        message: 'profile not found',
      });
    }

    const ir = new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(0, #6c47d7 5%, #1e1f21 70%)',
            height: '100%',
            width: '100%',
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            flexWrap: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
              marginBottom: '30px',
              marginTop: '30px',
            }}
          >
            <img
              alt="Vercel"
              height={75}
              src={
                'https://colinks.orcanize.app/imgs/logo/colinks-logo-white.png'
              }
            />
          </div>
          <OGAvatar avatar={profile.avatar} />
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              color: 'white',
              marginTop: 30,
              padding: '0 120px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '24px',
              fontSize: 32,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              color: '#b6b8bb',
              marginTop: 30,
              padding: '0 120px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={32}
                height={32}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#b6b8bb"
                  fillRule="nonzero"
                  d="M9.739 5.268a1.27 1.27 0 0 1-.898.373H6.277a.638.638 0 0 0-.636.636v2.564c0 .337-.135.66-.373.898L3.456 11.55a.638.638 0 0 0 0 .898l-.899.898a1.912 1.912 0 0 1 0-2.698L4.37 8.84V6.277c0-1.053.854-1.907 1.907-1.907h2.564l1.812-1.813a1.912 1.912 0 0 1 2.698 0L15.16 4.37h2.564c1.053 0 1.907.854 1.907 1.907v2.564l1.813 1.812a1.912 1.912 0 0 1 0 2.698L19.63 15.16v2.564a1.908 1.908 0 0 1-1.907 1.907h-2.564l-1.812 1.813a1.912 1.912 0 0 1-2.698 0L8.84 19.63H6.277a1.908 1.908 0 0 1-1.907-1.907v-2.564l-1.813-1.812.899-.898 1.812 1.812c.238.239.373.56.373.898v2.564c0 .35.286.636.636.636h2.564c.337 0 .66.135.898.373l1.812 1.812a.638.638 0 0 0 .898 0l1.812-1.812a1.27 1.27 0 0 1 .898-.373h2.564c.35 0 .636-.286.636-.636v-2.564c0-.337.135-.66.373-.898l1.812-1.812a.638.638 0 0 0 0-.898l-1.812-1.812a1.27 1.27 0 0 1-.373-.898V6.277a.638.638 0 0 0-.636-.636h-2.564a1.27 1.27 0 0 1-.898-.373L12.45 3.456a.638.638 0 0 0-.898 0L9.739 5.268Z"
                />
              </svg>
              {profile.reputation_score?.total_score ?? 0} Rep Score
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={32}
                height={32}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#b6b8bb"
                  fillRule="nonzero"
                  d="M8.838 17.618A7.724 7.724 0 0 1 7.4 13.125c0-3.484 2.31-6.437 5.516-7.478A6.96 6.96 0 0 0 8.55 4.125c-3.81 0-6.9 3.023-6.9 6.75s3.09 6.75 6.9 6.75c.097 0 .194-.004.287-.007Zm1.308-.176c3.04-.703 5.304-3.378 5.304-6.567a6.64 6.64 0 0 0-1.596-4.317c-3.04.703-5.304 3.378-5.304 6.567 0 1.642.6 3.146 1.596 4.317Zm-.417 1.224c-.385.056-.78.084-1.179.084-4.445 0-8.05-3.526-8.05-7.875S4.105 3 8.55 3c2.239 0 4.262.893 5.721 2.334a8.122 8.122 0 0 1 1.179-.084c4.445 0 8.05 3.526 8.05 7.875S19.895 21 15.45 21a8.114 8.114 0 0 1-5.721-2.334Zm5.434-12.284a7.732 7.732 0 0 1 1.437 4.493c0 3.484-2.31 6.437-5.516 7.478a6.96 6.96 0 0 0 4.366 1.522c3.81 0 6.9-3.023 6.9-6.75s-3.09-6.75-6.9-6.75c-.097 0-.194.004-.287.007Z"
                />
              </svg>
              {profile.links} Link{profile.links > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    Readable.fromWeb(ir.body as ReadableStream<any>).pipe(res);
  } catch (e: any) {
    console.error(`${e.message}`, e);
    res.status(500).send({ message: 'Failed to generate the image' });
  }
}
