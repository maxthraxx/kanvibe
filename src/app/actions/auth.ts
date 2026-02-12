"use server";

import { validateCredentials, createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * 로그인 폼의 Server Action.
 * @returns 실패 시 에러 메시지를 반환한다
 */
export async function loginAction(formData: FormData): Promise<{ error: string } | void> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "아이디와 비밀번호를 입력해주세요." };
  }

  if (!validateCredentials(username, password)) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession();
  redirect("/");
}

/** 로그아웃 Server Action */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
