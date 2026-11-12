import { describe, expect, it } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Project } from '../models/Project.model';
import { User } from '../models/User.model';

describe('Mongoose models', () => {
	it('applies defaults and normalizes user and project fields', async () => {
		const user = new User({ name: '  Ada Lovelace  ', email: 'ADA@EXAMPLE.COM', passwordHash: 'hashed-password' });
		const project = new Project({
			title: '  Roadmap  ',
			description: 'Delivery plan',
			owner: new Types.ObjectId(),
			budget: 0,
			deadline: new Date('2030-01-01T00:00:00.000Z')
		});

		expect(user.name).toBe('Ada Lovelace');
		expect(user.email).toBe('ada@example.com');
		expect(user.role).toBe('Contributor');
		expect(project.title).toBe('Roadmap');
		expect(project.status).toBe('Planning');
		expect(project.team).toEqual([]);

		await expect(user.validate()).resolves.toBeUndefined();
		await expect(project.validate()).resolves.toBeUndefined();
	});

	it('rejects missing and invalid required model fields', async () => {
		const user = new User({ name: '', email: '', passwordHash: '', role: 'Owner' });
		const project = new Project({ title: '', status: 'Unknown', budget: -1 });

		await expect(user.validate()).rejects.toMatchObject({
			name: 'ValidationError',
			errors: {
				name: expect.anything(),
				email: expect.anything(),
				passwordHash: expect.anything(),
				role: expect.anything()
			}
		});
		await expect(project.validate()).rejects.toMatchObject({
			name: 'ValidationError',
			errors: {
				title: expect.anything(),
				description: expect.anything(),
				status: expect.anything(),
				owner: expect.anything(),
				budget: expect.anything(),
				deadline: expect.anything()
			}
		});
	});

  it('declares User references and timestamped schemas', () => {
		const teamPath = Project.schema.path('team') as unknown as { embeddedSchemaType?: { options?: { ref?: string } } };

		expect(Project.schema.path('owner').options.ref).toBe('User');
		expect(teamPath.embeddedSchemaType?.options?.ref).toBe('User');
		expect(Project.schema.options.timestamps).toBe(true);
    expect(User.schema.options.timestamps).toBe(true);
  });

  it('compares passwords against passwordHash and declares reset fields', async () => {
    const user = new User({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: await bcrypt.hash('CorrectPassword1!', 1),
      resetPasswordToken: 'hashed-reset-token',
      resetPasswordExpires: new Date(Date.now() + 60_000)
    });

    await expect(user.comparePassword('CorrectPassword1!')).resolves.toBe(true);
    await expect(user.comparePassword('incorrect')).resolves.toBe(false);
    expect(User.schema.path('resetPasswordToken')).toBeDefined();
    expect(User.schema.path('resetPasswordExpires')).toBeDefined();
  });
});