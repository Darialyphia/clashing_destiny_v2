import { AppError } from '../../utils/error';
import { UserReadRepository } from '../../users/user.repository';
import { Email } from '../../utils/email';
import { Password } from '../../utils/password';

export class RegisterValidator {
  constructor(private userRepo: UserReadRepository) {}

  async validateEmail(email: Email) {
    const existing = await this.userRepo.getByEmail(email);
    if (existing) {
      throw new AppError('Email already in use');
    }
  }

  validatePassword(password: Password) {
    // Password validation is handled in the Password value object constructor
    // But you could add additional business rules here
    if (password.value.length < 8) {
      throw new AppError('Password must be at least 8 characters long');
    }
  }

  async validate(input: { email: Email; password: Password }) {
    await this.validateEmail(input.email);
    this.validatePassword(input.password);
  }
}
