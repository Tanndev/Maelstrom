const COMMIT_ANALYZER = [
    '@semantic-release/commit-analyzer',
    {
        preset: 'angular',
        revertPattern: /^revert\s+"?([\s\S]*?)"?\s*This reverts commit (\w*)\.?/i,
        releaseRules: [
            {type: 'rules', release: 'minor'},
            {type: 'lore', release: 'patch'},
            {type: 'feat', release: 'minor'},
            {type: 'fix', release: 'patch'},
            {type: 'perf', release: 'patch'},
            {type: 'revert', release: 'patch'},
            {type: 'style', scope: '/character.*/', release: 'minor'},
            {type: 'style', release: 'patch'},
            {type: 'ci', release: 'patch'}
        ]
    }
];

const RELEASE_NOTES_GENERATOR = [
    '@semantic-release/release-notes-generator',
    {
        preset: 'angular',
        writerOpts: {
            "transform": {
                "type": function (type) {
                    switch (type) {
                        case "rules":
                            return "Rule Changes";
                        case "lore":
                            return "Lore Changes";
                        case "feat":
                            return "Features";
                        case "fix":
                            return "Fixes";
                        case "perf":
                            return "Performance Improvements";
                        case "revert":
                            return "Reverts";
                        case "docs":
                            return "Documentation";
                        case "style":
                            return "Styles";
                        case "refactor":
                            return "Refactoring";
                        case "test":
                            return "Tests";
                        case "build":
                            return "Build System";
                        case "ci":
                            return "Continuous Integration";
                        default:
                            return type;
                    }
                }
            }
        }
    }
];

const NPM = '@semantic-release/npm';

const GITHUB = [
    '@semantic-release/github',
    {
        successComment: "This ${issue.pull_request ? 'pull request is included' : 'issue is fixed'} in version ${nextRelease.version}",
        failTitle: 'CI: The automatic release failed',
        labels: ['release pipeline']
    }
];

const DOCKER = [
    'semantic-release-docker',
    {name: 'jftanner/maelstrom'}
];

module.exports = {
    branch: 'master',
    repositoryUrl: 'git@github.com:Tanndev/Maelstrom.git',
    plugins: [
        COMMIT_ANALYZER,
        RELEASE_NOTES_GENERATOR,
        NPM,
        GITHUB,
        DOCKER
    ]
};
