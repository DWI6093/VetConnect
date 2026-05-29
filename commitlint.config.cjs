module.exports = {
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feature',
        'bug',
        'hotfix',
        'refactor',
        'chore',
        'docs',
        'test',
        'performance'
      ]
    ],

    'scope-enum': [
      2,
      'always',
      [
        'frontend',
        'backend',
        'database',
        'auth',
        'ui-ux',
        'api'
      ]
    ],

    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [0]
  }
};