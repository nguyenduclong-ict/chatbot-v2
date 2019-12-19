const SERVER_URL = process.env.HOST || "localhost:" + process.env.PORT;
module.exports = {
  facebook: {
    example: {
      PAGE_ACCESS_TOKEN: "abc",
      VERIFY_TOKEN: "longnd",
      APP_SECRET: "abc",
      SERVER_URL
    },
    genius: {
      VERIFY_TOKEN: "longnd",
      APP_SECRET: "abc",
      SERVER_URL,
      pages: {
        genius_x: {
          PAGE_NAME: "genius_x",
          PAGE_ACCESS_TOKEN:
            "EAAF3jVsgN3cBAOiJqPzsvIxYhH68eNbLk6if9CIToRc16VyrffdZCGBUCgvxjZCUe4fXNL9sl8xWK7VYZA7zKFfZCSukzqMKWh8ZCzcRDl45eRsUZA8AKLJCCXZBAbK9tavMdors3hHYhwK6j3sJrWRjPblARwoCdZBDivAmOoOKlwZDZD",
          PAGE_ID: "113088293458523"
        },
        jarvis: {
          PAGE_NAME: "jarvis",
          PAGE_ACCESS_TOKEN:
            "EAAF3jVsgN3cBAEpTUpRKFtGZBpn15aKZAs2VgrQc7ZAoc7NkOX9ToTJfuEGo45UNjcbrecSB79nDZCJFRlf9YYSnMET6jHpe7sd8UNTCYypVjuhicTGdys2iWLCPxzOzz0ROsm800vHszxPIDDwNgsud8O4XVBSvyTWsdJtyBZBfHZAGZAG9LUg",
          PAGE_ID: "101981527879542"
        }
      }
    }
  }
};
