<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { Badge } from '$lib/components/ui/badge/index';
	import * as Card from '$lib/components/ui/card/index';
	import * as Pagination from '$lib/components/ui/pagination/index';
	import { Progress } from '$lib/components/ui/progress/index';
	import { Separator } from '$lib/components/ui/separator/index';
	import * as Table from '$lib/components/ui/table/index';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';

	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Copy from 'lucide-svelte/icons/copy';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import File from 'lucide-svelte/icons/file';
	import ListFilter from 'lucide-svelte/icons/list-filter';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Truck from 'lucide-svelte/icons/truck';

	import type { PageData } from './$types';
	import {
		getApplicationReplicasDesired,
		getApplicationReplicasReady,
		getVariantForApplicationReplicasStatus,
		getVariantForNode,
		getVariantForPod,
		timeSince
	} from '@/helpers';
	import Vert from '@/components/vert.svelte';

	export let data: PageData;
	let applications = data.applications;
</script>

<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
	{#if false}
		<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
			<Card.Root
				data-x-chunk-name="dashboard-05-chunk-1"
				data-x-chunk-description="A stats card showing this week's total sales in USD, the percentage difference from last week, and a progress bar."
			>
				<Card.Header class="pb-2">
					<Card.Description>CPU Usage</Card.Description>
					<Card.Title class="text-4xl">$1329</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="text-xs text-muted-foreground">+25% from last week</div>
				</Card.Content>
				<Card.Footer>
					<Progress value={25} aria-label="25% increase" />
				</Card.Footer>
			</Card.Root>
			<Card.Root
				data-x-chunk-name="dashboard-05-chunk-2"
				data-x-chunk-description="A stats card showing this month's total sales in USD, the percentage difference from last month, and a progress bar."
			>
				<Card.Header class="pb-2">
					<Card.Description>Memory Usage</Card.Description>
					<Card.Title class="text-3xl">$5,329</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="text-xs text-muted-foreground">+10% from last month</div>
				</Card.Content>
				<Card.Footer>
					<Progress value={12} aria-label="12% increase" />
				</Card.Footer>
			</Card.Root>
		</div>
	{/if}
	<Tabs.Root value="week">
		<div class="flex items-center">
			<Tabs.List>
				<Tabs.Trigger value="week">All</Tabs.Trigger>
				<Tabs.Trigger value="month">Deployments</Tabs.Trigger>
				<Tabs.Trigger value="year">StatefulSets</Tabs.Trigger>
			</Tabs.List>
			<div class="ml-auto flex items-center gap-2">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="outline" size="sm" class="h-7 gap-1 text-sm" builders={[builder]}>
							<ListFilter class="h-3.5 w-3.5" />
							<span class="sr-only sm:not-sr-only">Filter</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Label>Filter by</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.CheckboxItem checked>Fulfilled</DropdownMenu.CheckboxItem>
						<DropdownMenu.CheckboxItem>Declined</DropdownMenu.CheckboxItem>
						<DropdownMenu.CheckboxItem>Refunded</DropdownMenu.CheckboxItem>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Button size="sm" variant="outline" class="h-7 gap-1 text-sm">
					<File class="h-3.5 w-3.5" />
					<span class="sr-only sm:not-sr-only">Export</span>
				</Button>
			</div>
		</div>
		<Tabs.Content value="week">
			<Card.Root
				data-x-chunk-name="dashboard-05-chunk-3"
				data-x-chunk-description="A table of Deployments, StatefulSets, Daemonsets, and a brief overview of their related resources."
			>
				<Card.Header class="px-7">
					<Card.Title>Applications</Card.Title>
					<Card.Description
						>Deployments, StatefulSets, Daemonsets, and a brief overview of their related resources.</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="">Name</Table.Head>
								<Table.Head class="hidden sm:table-cell">Namespace</Table.Head>
								<Table.Head class="hidden sm:table-cell">Status</Table.Head>
								<Table.Head class="hidden md:table-cell">Pods</Table.Head>
								<!-- <Table.Head class="hidden md:table-cell">Service</Table.Head> -->
								<Table.Head class="hidden md:table-cell">Nodes</Table.Head>
								<Table.Head class="text-right">Age</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each applications as application}
								<Table.Row>
									<Table.Cell>
										<div class="font-medium">{application.definition.metadata?.name}</div>
										<div class="hidden text-sm text-muted-foreground md:inline">
											{application.definition.kind}
										</div>
									</Table.Cell>
									<Table.Cell class="hidden sm:table-cell"
										>{application.definition.metadata?.namespace}</Table.Cell
									>
									<Table.Cell class="hidden sm:table-cell">
										<Badge
											class="whitespace-nowrap text-xs"
											variant={getVariantForApplicationReplicasStatus(application)}
											>{getApplicationReplicasReady(application)} / {getApplicationReplicasDesired(
												application
											)}</Badge
										>
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell">
										<Collapsible.Root class="relative">
											<Vert>
												{#each application.pods.slice(0, 2) as pod}
													<Badge class="text-xs" variant={getVariantForPod(pod)}
														>{pod.metadata?.name}</Badge
													>
												{/each}
											</Vert>
											{#if application.pods.length > 2}
												<Collapsible.Content class="mt-1 flex flex-col items-start gap-1">
													{#each application.pods.slice(2) as pod}
														<Badge class="text-xs" variant={getVariantForPod(pod)}
															>{pod.metadata?.name}</Badge
														>
													{/each}
												</Collapsible.Content>
												<Collapsible.Trigger class="my-1">
													<Badge class="text-xs" variant="default"
														>{application.pods.length - 2} more...</Badge
													>
												</Collapsible.Trigger>
											{/if}
										</Collapsible.Root>
									</Table.Cell>
									<Table.Cell class="hidden md:table-cell">
										<Vert>
											{#each application.nodes as node}
												<Badge class="text-xs" variant={getVariantForNode(node)}
													>{node.metadata?.name}</Badge
												>
											{/each}
										</Vert>
									</Table.Cell>
									<Table.Cell class="text-right"
										>{timeSince(application.definition.metadata?.creationTimestamp)}</Table.Cell
									>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
{#if false}
	<div>
		<Card.Root
			class="overflow-hidden"
			data-x-chunk-name="dashboard-05-chunk-4"
			data-x-chunk-description="An order details card with order details, shipping information, customer information and payment information."
		>
			<Card.Header class="flex flex-row items-start bg-muted/50">
				<div class="grid gap-0.5">
					<Card.Title class="group flex items-center gap-2 text-lg">
						Order Oe31b70H
						<Button
							size="icon"
							variant="outline"
							class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Copy class="h-3 w-3" />
							<span class="sr-only">Copy Order ID</span>
						</Button>
					</Card.Title>
					<Card.Description>Date: November 23, 2023</Card.Description>
				</div>
				<div class="ml-auto flex items-center gap-1">
					<Button size="sm" variant="outline" class="h-8 gap-1">
						<Truck class="h-3.5 w-3.5" />
						<span class="lg:sr-only xl:not-sr-only xl:whitespace-nowrap"> Track Order </span>
					</Button>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} size="icon" variant="outline" class="h-8 w-8">
								<EllipsisVertical class="h-3.5 w-3.5" />
								<span class="sr-only">More</span>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item>Edit</DropdownMenu.Item>
							<DropdownMenu.Item>Export</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>Trash</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</Card.Header>
			<Card.Content class="p-6 text-sm">
				<div class="grid gap-3">
					<div class="font-semibold">Order Details</div>
					<ul class="grid gap-3">
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">
								Glimmer Lamps x <span>2</span>
							</span>
							<span>$250.00</span>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">
								Aqua Filters x <span>1</span>
							</span>
							<span>$49.00</span>
						</li>
					</ul>
					<Separator class="my-2" />
					<ul class="grid gap-3">
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">Subtotal</span>
							<span>$299.00</span>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">Shipping</span>
							<span>$5.00</span>
						</li>
						<li class="flex items-center justify-between">
							<span class="text-muted-foreground">Tax</span>
							<span>$25.00</span>
						</li>
						<li class="flex items-center justify-between font-semibold">
							<span class="text-muted-foreground">Total</span>
							<span>$329.00</span>
						</li>
					</ul>
				</div>
				<Separator class="my-4" />
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-3">
						<div class="font-semibold">Shipping Information</div>
						<address class="grid gap-0.5 not-italic text-muted-foreground">
							<span>Liam Johnson</span>
							<span>1234 Main St.</span>
							<span>Anytown, CA 12345</span>
						</address>
					</div>
					<div class="grid auto-rows-max gap-3">
						<div class="font-semibold">Billing Information</div>
						<div class="text-muted-foreground">Same as shipping address</div>
					</div>
				</div>
				<Separator class="my-4" />
				<div class="grid gap-3">
					<div class="font-semibold">Customer Information</div>
					<dl class="grid gap-3">
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground">Customer</dt>
							<dd>Liam Johnson</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground">Email</dt>
							<dd>
								<a href="mailto:">liam@acme.com</a>
							</dd>
						</div>
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground">Phone</dt>
							<dd>
								<a href="tel:">+1 234 567 890</a>
							</dd>
						</div>
					</dl>
				</div>
				<Separator class="my-4" />
				<div class="grid gap-3">
					<div class="font-semibold">Payment Information</div>
					<dl class="grid gap-3">
						<div class="flex items-center justify-between">
							<dt class="flex items-center gap-1 text-muted-foreground">
								<CreditCard class="h-4 w-4" />
								Visa
							</dt>
							<dd>**** **** **** 4532</dd>
						</div>
					</dl>
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
				<div class="text-xs text-muted-foreground">
					Updated <time dateTime="2023-11-23">November 23, 2023</time>
				</div>
				<Pagination.Root count={10} class="ml-auto mr-0 w-auto">
					<Pagination.Content>
						<Pagination.Item>
							<Button size="icon" variant="outline" class="h-6 w-6">
								<ChevronLeft class="h-3.5 w-3.5" />
								<span class="sr-only">Previous Order</span>
							</Button>
						</Pagination.Item>
						<Pagination.Item>
							<Button size="icon" variant="outline" class="h-6 w-6">
								<ChevronRight class="h-3.5 w-3.5" />
								<span class="sr-only">Next Order</span>
							</Button>
						</Pagination.Item>
					</Pagination.Content>
				</Pagination.Root>
			</Card.Footer>
		</Card.Root>
	</div>
{/if}
