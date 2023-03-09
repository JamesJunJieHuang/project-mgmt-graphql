const Project = require("../models/Project");
const Client = require("../models/Client");
//user needs this
const { GraphQLResolveInfo } = require("graphql");

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
} = require("graphql");

// Movie Type
const MovieType = new GraphQLObjectType({
  name: "Movie",
  fields: () => ({
    title: { type: GraphQLString },
    cod: { type: GraphQLString },
    message: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});

// Project Type
const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve(parent, args) {
        return Client.findById(parent.clientId);
      },
    },
  }),
});

// Client Type
const ClientType = new GraphQLObjectType({
  name: "Client",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    title: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // movies: {
    //   type: MovieType,
    //   resolve(parent, args) {
    //     fetch("https://swapi.dev/api/people/9")
    //     .then((resp)=>{
    //       console.log('resp: ', resp)
    //       return resp.json()})
    //     .then((data)=>{
    //       console.log('data name: ', data.name)
    //       return data.name;
    //     })
    //   },
    // },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve(parent, args) {
        return Project.find();
      },
    },
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Project.findById(args.id);
      },
    },
    clients: {
      type: new GraphQLList(ClientType),
      resolve(parent, args) {
        return Client.find();
      },
    },
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args, context, info) {
        try {
          const response = await fetch(
            `https://swapi.dev/api/films/${args.id}`
            //https://api.openweathermap.org/data/2.5/weather?q=alaska&appid=6e1a0f5534e59feddcb2739dab099610
          );
          const film = await response.json();
          //npm-function(response,film)/////////////////////////////////////////////////////
          const responseObj = {
            argId: args.id,
            alias: info.path.key,
            parentNode: info.fieldName,
            originResp: film,
            originRespStatus: response.status,
            originRespMessage: response.statusText,
          };

          console.log("RESPONSE OBJECT: ", responseObj);

          fetch("http://localhost:3000/originalRespReceiver", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(responseObj),
          })
            .then((data) => {
              return data.json();
            })
            .then((resp) => {
              console.log("originresp: ", resp);
            });
          return film;
        } catch (err) {
          console.error("Error fetching movie:", err);
          throw new Error("Unable to fetch movie");
        }
      },
    },
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args, context, info) {
        try {
          const response = await fetch(
            `https://swapi.dev/api/films/${args.id}`
            //https://api.openweathermap.org/data/2.5/weather?q=alaska&appid=6e1a0f5534e59feddcb2739dab099610
          );
          const film = await response.json();
          //npm-function(response,film)/////////////////////////////////////////////////////
          const responseObj = {
            argId: args.id,
            alias: info.path.key,
            parentNode: info.fieldName,
            originResp: film,
            originRespStatus: response.status,
            originRespMessage: response.statusText,
          };

          console.log("RESPONSE OBJECT: ", responseObj);

          fetch("http://localhost:3000/originalRespReceiver", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(responseObj),
          })
            .then((data) => {
              return data.json();
            })
            .then((resp) => {
              console.log("originresp: ", resp);
            });
          /////////////////////////////////////////////////////////////////////////////

          // const mock = await (
          //   await fetch(
          //https://api.openweathermap.org/data/2.5/weather?q=asjdhfbjh&appid=6e1a0f5534e59feddcb2739dab099610
          //https://swapi.dev/api/films/9000
          //     `http://localhost:5001/errormock`
          //   )
          // ).json();
          // console.log('mock: ', mock)
          return film;
        } catch (err) {
          console.error("Error fetching movie:", err);
          throw new Error("Unable to fetch movie");
        }
      },
    },
  },
});

// Mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Add a client
    addClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const client = new Client({
          name: args.name,
          email: args.email,
          phone: args.phone,
        });

        return client.save();
      },
    },
    // Delete a client
    deleteClient: {
      type: ClientType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        Project.find({ clientId: args.id }).then((projects) => {
          projects.forEach((project) => {
            project.remove();
          });
        });

        return Client.findByIdAndRemove(args.id);
      },
    },
    // Add a project
    addProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        status: {
          type: new GraphQLEnumType({
            name: "ProjectStatus",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progress" },
              completed: { value: "Completed" },
            },
          }),
          defaultValue: "Not Started",
        },
        clientId: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const project = new Project({
          name: args.name,
          description: args.description,
          status: args.status,
          clientId: args.clientId,
        });

        return project.save();
      },
    },
    // Delete a project
    deleteProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Project.findByIdAndRemove(args.id);
      },
    },
    // Update a project
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: {
          type: new GraphQLEnumType({
            name: "ProjectStatusUpdate",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progress" },
              completed: { value: "Completed" },
            },
          }),
        },
      },
      resolve(parent, args) {
        return Project.findByIdAndUpdate(
          args.id,
          {
            $set: {
              name: args.name,
              description: args.description,
              status: args.status,
            },
          },
          { new: true }
        );
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
