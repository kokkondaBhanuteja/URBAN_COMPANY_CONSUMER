import { NextResponse } from 'next/server';
import { CookieSerializeOptions } from 'cookie';

export const setCookie = (
  res: NextResponse,
  name: string,
  value: unknown,
  options: Partial<CookieSerializeOptions & { httpOnly: boolean; maxAge: number }> = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

  res.cookies.set(name, stringValue, options);
};

export const clearCookie = (res: NextResponse, name: string) => {
    res.cookies.set(name, '', { expires: new Date(0), path: '/' });
};