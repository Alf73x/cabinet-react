import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { login, saveAuth } from "../api/authService";
import "./LoginDialog.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (loginName: string) => void;
};

export default function LoginDialog({
  open,
  onClose,
  onLoginSuccess,
}: Props) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");
    setPassword("");

    requestAnimationFrame(() => {
      loginInputRef.current?.focus();
    });
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedLoginName = loginName.trim();

    if (!normalizedLoginName) {
      setError("Введите имя пользователя");
      loginInputRef.current?.focus();
      return;
    }

    if (!password) {
      setError("Введите пароль");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(normalizedLoginName, password);

      saveAuth(result.access_token, normalizedLoginName);
      onLoginSuccess(normalizedLoginName);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось выполнить вход",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div
      className="login-dialog-backdrop"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="login-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="login-dialog__header">
          <h2 id="login-dialog-title">Вход</h2>

          <button
            type="button"
            className="login-dialog__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-dialog__body">
            <label className="login-dialog__field">
              <span>Имя пользователя</span>

              <input
                ref={loginInputRef}
                type="text"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </label>

            <label className="login-dialog__field">
              <span>Пароль</span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            {error && (
              <div className="login-dialog__error">
                {error}
              </div>
            )}
          </div>

          <div className="login-dialog__footer">
            <button
              type="submit"
              className="login-dialog__button login-dialog__button--primary"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </button>

            <button
              type="button"
              className="login-dialog__button login-dialog__button--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}