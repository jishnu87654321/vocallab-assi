import mongoose from 'mongoose';
import config from './config.js';

/**
 * @typedef {Object} SessionEvent
 * @property {string} type - Event type (e.g., stage_start, stage_complete, item, warning, checkpoint, complete, error)
 * @property {number} [stage] - Stage index (0-4)
 * @property {string} [label] - Descriptive text
 * @property {number} [count] - Count of items processed
 * @property {string} [message] - Warning or error log message
 * @property {any} [data] - Arbitrary event data (e.g., prospect, contact detail)
 * @property {Date} ts - Timestamp of event
 */

/**
 * @typedef {Object} StageInfo
 * @property {string} status - 'pending' | 'running' | 'completed' | 'failed'
 * @property {Date} [startedAt] - Start timestamp
 * @property {Date} [completedAt] - Completion timestamp
 * @property {any} output - Stage-specific outputs (domains, prospects, contacts, or send metrics)
 */

/**
 * @typedef {Object} PipelineSummary
 * @property {number} lookalikes - Number of company domains found
 * @property {number} prospects - Number of scraped decision makers
 * @property {number} emailsResolved - Number of verified business emails
 * @property {number} emailsSent - Successful email dispatches
 * @property {number} emailsFailed - Failed email dispatches
 */

/**
 * @typedef {Object} OutreachSession
 * @property {string} sessionId - Unique session ID prefix with vcr_
 * @property {string} seedDomain - Target seed domain (e.g., stripe.com)
 * @property {string} status - 'running' | 'awaiting_confirm' | 'completed' | 'failed' | 'cancelled'
 * @property {Date} createdAt - Session creation date
 * @property {Date} [completedAt] - Date the pipeline finished
 * @property {Object} stages - Map of execution phases
 * @property {StageInfo} stages.stage0 - Init phase
 * @property {StageInfo} stages.stage1 - Ocean.io lookup
 * @property {StageInfo} stages.stage2 - Prospeo scraping
 * @property {StageInfo} stages.stage3 - Eazyreach validation
 * @property {StageInfo} stages.stage4 - Brevo campaign dispatch
 * @property {PipelineSummary} summary - Aggregated metrics
 * @property {SessionEvent[]} events - SSE event logs for progress replay
 */

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  stage: { type: Number },
  label: { type: String },
  count: { type: Number },
  message: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  total: { type: Number },
  preview: { type: mongoose.Schema.Types.Mixed },
  summary: { type: mongoose.Schema.Types.Mixed },
  ts: { type: Date, default: Date.now }
}, { _id: false });

const stageSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  output: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  seedDomain: { type: String, required: true },
  status: {
    type: String,
    enum: ['running', 'awaiting_confirm', 'completed', 'failed', 'cancelled'],
    default: 'running'
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  stages: {
    stage0: { type: stageSchema, default: () => ({ status: 'pending' }) },
    stage1: { type: stageSchema, default: () => ({ status: 'pending' }) },
    stage2: { type: stageSchema, default: () => ({ status: 'pending' }) },
    stage3: { type: stageSchema, default: () => ({ status: 'pending' }) },
    stage4: { type: stageSchema, default: () => ({ status: 'pending' }) }
  },
  summary: {
    lookalikes: { type: Number, default: 0 },
    prospects: { type: Number, default: 0 },
    emailsResolved: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
    emailsFailed: { type: Number, default: 0 }
  },
  events: { type: [eventSchema], default: [] }
}, {
  timestamps: false
});

// Configure Mongoose connection options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[DB] Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export const Session = mongoose.model('Session', sessionSchema);
export default connectDB;
