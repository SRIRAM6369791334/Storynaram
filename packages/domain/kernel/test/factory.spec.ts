import { describe, it, expect } from 'vitest';
import { Factory } from '../src/factory';
import { FactoryError } from '../src/errors';
import { Identity } from '../src/identity';
import { Entity } from '../src/entity';

interface UserProps {
  id: string;
  name: string;
  email: string;
}

class User extends Entity<Identity<string>> {
  constructor(
    id: string,
    public name: string,
    public email: string,
  ) {
    super(new Identity(id));
  }
}

class UserFactory extends Factory<User, UserProps> {
  create(props: UserProps): User {
    this.assertValid(props.name.length > 0, 'Name is required');
    this.assertValid(props.email.includes('@'), 'Invalid email');
    return new User(props.id, props.name, props.email);
  }

  reconstitute(state: Record<string, unknown>): User {
    return new User(
      state.id as string,
      state.name as string,
      state.email as string,
    );
  }
}

describe('Factory', () => {
  it('creates an entity', () => {
    const factory = new UserFactory();
    const user = factory.create({ id: '1', name: 'Alice', email: 'alice@test.com' });
    expect(user).toBeInstanceOf(User);
    expect(user.identity.value).toBe('1');
    expect(user.name).toBe('Alice');
  });

  it('throws FactoryError on invalid input', () => {
    const factory = new UserFactory();
    expect(() => factory.create({ id: '1', name: '', email: 'alice@test.com' })).toThrow(FactoryError);
  });

  it('throws FactoryError on invalid email', () => {
    const factory = new UserFactory();
    expect(() => factory.create({ id: '1', name: 'Alice', email: 'invalid' })).toThrow(FactoryError);
  });

  it('reconstitutes from state', () => {
    const factory = new UserFactory();
    const user = factory.reconstitute({ id: '2', name: 'Bob', email: 'bob@test.com' });
    expect(user.identity.value).toBe('2');
    expect(user.name).toBe('Bob');
  });
});
