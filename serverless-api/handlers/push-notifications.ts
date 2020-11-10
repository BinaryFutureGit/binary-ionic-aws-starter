import * as cors from "@koa/cors";
import { APIGatewayEvent, Context } from "aws-lambda";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as serverlessHttp from "serverless-http";
import "source-map-support/register";

/**
 * This type definition allows us to update the Koa.ParameterizedContext with
 * the custom request mapping defined below.
 */
interface CustomRequestContext {
  req: {
    event: APIGatewayEvent;
    context: Context;
  };
}

const app = new Koa<any, CustomRequestContext>();

app.use(bodyParser());
app.use(cors({ keepHeadersOnError: true }));

app.use(async ctx => {
  const { body } = ctx.request;
  // const key = process.env["API_KEY"];
  try {
    ctx.response.body = { context: ctx.req.context, event: ctx.req.event };
  } catch (error) {
    console.error("error", error);
    ctx.throw(400, error.description);
  }
});

export const post = serverlessHttp(app, {
  request: (request, event: APIGatewayEvent, context: Context) => {
    request.event = event;
    request.context = context;
  },
});
