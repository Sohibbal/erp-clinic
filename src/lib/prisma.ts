import { PrismaClient } from '../generated/prisma/client'

const prismaClientSingleton = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({} as any)
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
