import { serialize, CookieSerializeOptions } from 'cookie';
import { NextResponse } from 'next/server';

export const setCookie = (
  res: NextResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge!);
    options.maxAge! /= 1000;
  }

  res.headers.append('Set-Cookie', serialize(name, String(stringValue), options));
};

export const clearCookie = (res: NextResponse, name: string) => {
  res.headers.append(
    'Set-Cookie',
    serialize(name, '', {
      expires: new Date(0),
      path: '/',
    })
  );
};
