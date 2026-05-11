// lib/validations/schemas.ts
import * as z from 'zod';

export const transactionSchema = z.object({
  amount: z.preprocess((val) => {
    if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
    return val;
  }, z.number().positive('Le montant doit être positif')),
  type: z.enum(['income', 'expense']),
  label: z.string().min(1, 'La description est requise'),
  category: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  date: z.string().min(1, 'La date est requise'),
  is_recurring: z.boolean().default(false),
  recurrence_type: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional().nullable(),
  recurrence_end_date: z.string().optional().nullable(),
});

export const childAccountSchema = z.object({
  name: z.string().min(1, "Le nom de l'enfant est requis"),
  avatar_color: z.string().default('#22d3ee'),
  monthly_limit: z.coerce.number().positive('La limite doit être positive').optional(),
});

export const inviteViewerSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Le nom de l'objectif est requis"),
  target_amount: z.coerce.number().positive('Le montant cible doit être positif'),
  current_amount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default('#6366f1'),
});

export const profileSchema = z.object({
  display_name: z.string().min(1, "Le nom d'affichage est requis"),
  avatar_color: z.string().default('#6366f1'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

export const registerSchema = loginSchema.extend({
  display_name: z.string().min(1, "Le nom d'affichage est requis"),
});
