export const categories = ['Account access', 'Connectivity', 'Hardware', 'Software', 'Other'];
export const priorities = ['Low', 'Medium', 'High', 'Urgent'];
export const statuses = ['Open', 'In progress', 'Resolved', 'Closed'];

const relativeMinutes = (m) => new Date(Date.now() - m * 60000).toISOString();

export const seedTickets = [
  {
    id: 'DF-1042', subject: 'Cannot access student portal', category: 'Account access',
    priority: 'High', status: 'Open', customer: 'Eka Kapanadze', customerShort: 'Eka K.',
    assignee: 'Unassigned', description: 'I changed my password this morning, but I cannot sign in. The verification code keeps getting rejected.',
    updatedAt: relativeMinutes(12), createdAt: relativeMinutes(105),
    comments: [
      { id: 'c1', author: 'Eka Kapanadze', text: 'I changed my password this morning, but I cannot sign in.\nThe verification code keeps getting rejected.', createdAt: relativeMinutes(105) },
      { id: 'c2', author: 'Support Team', text: 'We are checking your account and will follow up shortly.', createdAt: relativeMinutes(72) },
    ],
  },
  {
    id: 'DF-1041', subject: 'Laptop VPN disconnects', category: 'Connectivity', priority: 'Medium',
    status: 'In progress', customer: 'Jonas Kahnwald', customerShort: 'Jonas K.', assignee: 'Support Team',
    description: 'The laptop VPN disconnects after several minutes. This happens on Wi-Fi and Ethernet.',
    updatedAt: relativeMinutes(35), createdAt: relativeMinutes(190),
    comments: [{ id: 'c3', author: 'Jonas Kahnwald', text: 'The VPN disconnects every few minutes.', createdAt: relativeMinutes(190) }],
  },
  {
    id: 'DF-1040', subject: 'Reset MFA for staff account', category: 'Account access', priority: 'Urgent',
    status: 'Open', customer: 'Martha Nielsen', customerShort: 'Martha N.', assignee: 'Unassigned',
    description: 'My authenticator phone was replaced. Please help reset multi-factor authentication.',
    updatedAt: relativeMinutes(60), createdAt: relativeMinutes(220), comments: [],
  },
  {
    id: 'DF-1039', subject: 'Printer queue stuck on floor 2', category: 'Hardware', priority: 'Low',
    status: 'Resolved', customer: 'Peggy Blumquist', customerShort: 'Peggy B.', assignee: 'Support Team',
    description: 'Print jobs remain in queue without printing on floor 2.',
    updatedAt: relativeMinutes(240), createdAt: relativeMinutes(550), comments: [],
  },
  {
    id: 'DF-1038', subject: 'Software licence request', category: 'Software', priority: 'Medium',
    status: 'Closed', customer: 'Lumen Pierce', customerShort: 'Lumen P.', assignee: 'Support Team',
    description: 'Please provide a licence for the software needed for our coursework.',
    updatedAt: relativeMinutes(1620), createdAt: relativeMinutes(4000), comments: [],
  },
];
