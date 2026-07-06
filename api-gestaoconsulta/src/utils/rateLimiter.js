class RateLimiter {
  constructor() {
    this.store = new Map(); 
  }

  canAttempt(email) {
    const now = Date.now();
    const record = this.store.get(email);
    const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
    const MAX_ATTEMPTS = 3;

    // Se não há registo, cria um novo
    if (!record) {
      this.store.set(email, { count: 1, firstAttempt: now });
      return true;
    }

    // Se passou mais de 10 minutos desde a primeira tentativa, reinicia o contador
    if (now - record.firstAttempt > WINDOW_MS) {
      this.store.set(email, { count: 1, firstAttempt: now });
      return true;
    }

    if (record.count >= MAX_ATTEMPTS) {
      return false;
    }

    record.count += 1;
    this.store.set(email, record);
    return true;
  }

  clean() {
    const now = Date.now();
    const WINDOW_MS = 10 * 60 * 1000;
    for (const [email, record] of this.store.entries()) {
      if (now - record.firstAttempt > WINDOW_MS) {
        this.store.delete(email);
      }
    }
  }
}

export default new RateLimiter();