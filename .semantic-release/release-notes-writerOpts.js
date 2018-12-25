module.exports = {
    "transform": {
        "type": function (type) {
            switch (type) {
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
                case "rules":
                    return "Rule Changes";
                default:
                    return type;
            }
        }
    }
};
