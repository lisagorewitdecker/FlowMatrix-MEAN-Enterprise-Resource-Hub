import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables if running outside container
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { User } from '../models/User.model';
import { Project } from '../models/Project.model';

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://mongodb:27017/flowmatrix';

async function seedDatabase(): Promise<void> {
  console.log(' Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  console.log(' Cleaning existing database collections...');
  await Promise.all([User.deleteMany({}), Project.deleteMany({})]);

  console.log(' Creating administrative and contributor seed accounts...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const admin = await User.create({
    name: 'lgorewit',
    email: 'lgorewit@gmail.com',
    passwordHash,
    role: 'Admin'
  });

  const contributor = await User.create({
    name: 'Dev Team Contributor',
    email: 'dev@flowmatrix.io',
    passwordHash,
    role: 'Contributor'
  });

  const now = new Date();
  const getOffsetDate = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  console.log(' Populating enterprise project portfolio...');
  await Project.create([
    {
      title: 'Global Multi-Region Cloud Migration',
      description: 'Migrating legacy monoliths into distributed Amazon EKS clusters with Istio service mesh.',
      status: 'Active',
      budget: 185000,
      deadline: getOffsetDate(45),
      owner: admin._id
    },
    {
      title: 'Zero-Trust SSO & Directory Federation',
      description: 'Enforcing hardware FIDO2 keys, conditional access policies, and Okta SCIM sync.',
      status: 'Active',
      budget: 64000,
      deadline: getOffsetDate(20),
      owner: contributor._id
    },
    {
      title: 'Automated Log Pipeline & OpenTelemetry',
      description: 'Replacing heavy log forwarders with Vector and Kafka collectors for central audit retention.',
      status: 'Planning',
      budget: 42000,
      deadline: getOffsetDate(90),
      owner: admin._id
    },
    {
      title: 'SOC2 Type II Audit Automation',
      description: 'Continuous infrastructure compliance evidence gathering via cloud security posture tooling.',
      status: 'Planning',
      budget: 35000,
      deadline: getOffsetDate(60),
      owner: contributor._id
    },
    {
      title: 'Data Lakehouse Partitioning Overhaul',
      description: 'Restructuring Iceberg tables and Athena partition indexing to cut query latency by 40%.',
      status: 'On-Hold',
      budget: 52000,
      deadline: getOffsetDate(15),
      owner: admin._id
    },
    {
      title: 'Legacy Monolith Database Sharding',
      description: 'Database split to resolve horizontal scaling bottlenecks in primary transaction cluster.',
      status: 'On-Hold',
      budget: 88000,
      deadline: getOffsetDate(-14), // Overdue: triggers velocity telemetry
      owner: contributor._id
    },
    {
      title: 'Disaster Recovery Warm Failover Automation',
      description: 'Automated Route53 DNS health failovers and database replication drill verification.',
      status: 'Completed',
      budget: 95000,
      deadline: getOffsetDate(-30),
      owner: admin._id
    },
    {
      title: 'Frontend Micro-App Build Pipeline Optimization',
      description: 'Migrating build cache to remote Turborepo to shave 12 minutes off PR validation gates.',
      status: 'Completed',
      budget: 28000,
      deadline: getOffsetDate(-45),
      owner: contributor._id
    }
  ]);

  console.log('\n Seed process complete!');
  console.log('--------------------------------------------------');
  console.log('Admin Account:       lgorewit@gmail.com / Password123!');
  console.log('Contributor Account: dev@flowmatrix.io / Password123!');
  console.log('Projects Created:    8 projects across all 4 lifecycle states');
  console.log('--------------------------------------------------\n');

  await mongoose.disconnect();
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(' Seeder error:', err);
    process.exit(1);
  });
