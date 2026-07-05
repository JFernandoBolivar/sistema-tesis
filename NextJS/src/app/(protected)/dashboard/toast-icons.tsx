"use client";

import { Checks, XCircle, Info, Spinner, ShieldWarning } from "@phosphor-icons/react";

export function ToastSuccess() {
  return <Checks />;
}

export function ToastInfo() {
  return <Info />;
}

export function ToastWarning() {
  return <ShieldWarning />;
}

export function ToastError() {
  return <XCircle />;
}

export function ToastLoading() {
  return <Spinner />;
}
