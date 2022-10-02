import express from "express";

const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
  });