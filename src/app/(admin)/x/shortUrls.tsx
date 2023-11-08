'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import {
  ArrowUp,
  BarChart,
  Copy,
  Eye,
  Loader2,
  Pencil,
  Settings,
  Trash,
} from 'lucide-react'
import Link from 'next/link'
import { Bar } from 'react-chartjs-2'
import { toast } from 'sonner'
import { deleteShortUrl, getShortUrls } from './apis/shortUrls'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const Page = () => {
  const queryClient = useQueryClient()

  const { isPending, isError, data } = useQuery({
    queryKey: ['shortUrls'],
    queryFn: async () => {
      return (await getShortUrls()).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    },
  })

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await deleteShortUrl({
        id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shortUrls'],
      })
    },
  })

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-slate-500">Something went wrong</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const getGraphData = (visits: any) => {
    if (!visits) return []

    let data = visits.map((item: any) => [
      item.split('x')[0],
      Number(item.split('x')[1]),
    ])

    data =
      data.length < 7
        ? [...data, ...Array(7 - data.length).fill(['', 0])]
        : data.slice(0, 7)

    return data
  }

  return (
    <div className="mt-5 flex flex-col space-y-5">
      {data?.map((shortUrl: { id: string; url: string; visits_v2: any }) => (
        <div
          className="flex flex-col space-y-1.5 rounded-md border bg-background p-3 text-sm"
          key={shortUrl.id}
        >
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-1 px-2">
                {shortUrl?.visits_v2?.length ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <p className="flex text-green-500">
                      {shortUrl.visits_v2[0].split('x')[1]}
                    </p>
                  </>
                ) : (
                  ''
                )}
                <Eye className="h-3 w-3 text-foreground" />
                <p className="pt-px">
                  {shortUrl?.visits_v2?.length
                    ? getGraphData(shortUrl.visits_v2).reduce(
                        (a: any, b: any) => a + b[1],
                        0,
                      )
                    : 0}
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 p-1 px-2 text-[0.6rem]">
                <Link
                  className="text-black"
                  href={`/${shortUrl.id}`}
                  target="_blank"
                >
                  {process.env.NEXT_PUBLIC_APP_URL}/{shortUrl.id}
                </Link>
                <div className="h-1 w-1 rounded-full bg-slate-500/10" />
                <Copy
                  className="h-3 w-3 cursor-pointer text-slate-600"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_APP_URL}/${shortUrl.id}`,
                    )
                    toast.success('Copied to clipboard')
                  }}
                />
                <div className="h-1 w-1 rounded-full bg-slate-500/10" />
                {/* work zone */}
                <Menubar className="h-min rounded-full border-none p-0">
                  <MenubarMenu>
                    <MenubarTrigger className="bg-blue-50 p-0 focus:bg-blue-50 data-[state=open]:bg-blue-50">
                      <Settings className="h-3 w-3 cursor-pointer text-blue-600" />
                    </MenubarTrigger>
                    <MenubarContent className="absolute -right-5 min-w-[8rem] bg-foreground">
                      {/* <MenubarSeparator className="bg-background/10" /> */}
                      <AlertDialog>
                        <AlertDialogTrigger className="flex h-full w-full items-center justify-between rounded-sm p-1 text-[0.675rem] hover:bg-background/5">
                          <p className="text-background/60">Delete</p>
                          <Trash className="h-3 w-3 text-background/60" />
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-11/12 rounded-md font-mono">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-sm">
                              Do you want to delete this short URL?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-xs">
                              {shortUrl.id} for {shortUrl.url}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2">
                            <AlertDialogCancel className="px-8 text-xs">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 px-8 text-xs text-white"
                              onClick={() => {
                                mutation.mutate({ id: shortUrl.id })
                                toast.info('Deleted')
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
                {/* work zone end */}
              </div>
            </div>
            <p className="mt-0.5 line-clamp-2 break-all text-[0.65rem] text-foreground/70">
              {shortUrl.url}
            </p>
          </div>

          <Accordion
            className={cn(shortUrl?.visits_v2?.length ? 'block' : 'hidden')}
            type="single"
            collapsible
          >
            <AccordionItem className="-my-4 !border-b-0" value="item-1">
              <AccordionTrigger className="text-foreground/70">
                <p className="flex items-center gap-2 font-sans text-[0.6rem] font-light text-foreground/70">
                  <BarChart className="h-3 w-3" />{' '}
                  {/*
                    // ~ add last visit time here
                  */}
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <Bar
                  data={{
                    labels: getGraphData(shortUrl.visits_v2)
                      .reverse()
                      .map((item: any) => {
                        return item[0]
                          ? `${item[0].slice(4, 6)}-${item[0].slice(
                              2,
                              4,
                            )}-${item[0].slice(0, 2)}`
                          : ''
                      }),
                    datasets: [
                      {
                        label: 'Visits',
                        data: getGraphData(shortUrl.visits_v2)
                          .reverse()
                          .map((item: any) => item[1]),
                        backgroundColor: '#f43f5e',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        position: 'right',
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  )
}

export default Page
