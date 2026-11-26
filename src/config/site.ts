export const site = {
  name: "CoolShop",
  description:
    "A modern marketplace for everyday essentials — electronics, home, style, and more.",
  supportEmail: "hello@coolshop.dev",
} as const;

export const demoAccount = {
  name: "Demo Shopper",
  email: "demo@coolshop.dev",
  password: "demo12345",
} as const;

export const adminAccount = {
  name: "CoolShop Desk",
  email: "admin@coolshop.dev",
  password: "admin12345",
} as const;

/** Test tender. 1 CC is worth $1 of catalog price until a real processor is added. */
export const coolCash = {
  name: "CoolCash",
  code: "CC",
  welcomeCents: 50_000,
  demoBalanceCents: 200_000,
} as const;
