// "use client";

// import * as React from 'react';
// import {
//     NavigationMenu,
//     NavigationMenuContent,
//     NavigationMenuIndicator,
//     NavigationMenuItem,
//     NavigationMenuLink,
//     NavigationMenuList,
//     NavigationMenuTrigger,
//     NavigationMenuViewport,
//     navigationMenuTriggerStyle,
// } from "@/components/ui/navigation-menu";
// import { routes, components } from '../api/data';
// import {ListItem} from '.';
// import { cn } from '@/lib/utils';

// export interface INavigationMenuProps {
// }

// export function NavigationMenuComponent(props: INavigationMenuProps) {

//     const [path, setPath] = React.useState('#products');

//     return (
//         <>
//             <NavigationMenu className="hidden md:block">
//                 <NavigationMenuList className="gap-6">
//                     <NavigationMenuItem>
//                         <NavigationMenuTrigger
//                             onClick={() => setPath('#resources')}
//                             className={cn({
//                                 'dark:text-white': path === '#resources',
//                                 'dark:text-white/40': path !== '#resources',
//                                 'font-normal': true,
//                                 'text-xl': true,
//                             })}
//                         >
//                             Resources
//                         </NavigationMenuTrigger>
//                         <NavigationMenuContent>
//                             <ul
//                                 className="grid
//               gap-3
//               p-6
//               md:w-[400px]
//               ld:w-[500px]
//               lg:grid-cols-[.75fr_1fr]
//               "
//                             >
//                                 <li className="row-span-3">
//                                     <span
//                                         className="flex h-full w-full select-none
//                 flex-col
//                 justify-end
//                 rounded-md
//                 bg-gradient-to-b
//                 from-muted/50
//                 to-muted
//                 p-6 no-underline
//                 outline-none
//                 focus:shadow-md
//                 "
//                                     >
//                                         Welcome
//                                     </span>
//                                 </li>
//                                 <ListItem
//                                     href="#"
//                                     title="Introduction"
//                                 >
//                                     Re-usable components built using Radix UI and Tailwind CSS.
//                                 </ListItem>
//                                 <ListItem
//                                     href="#"
//                                     title="Installation"
//                                 >
//                                     How to install dependencies and structure your app.
//                                 </ListItem>
//                                 <ListItem
//                                     href="#"
//                                     title="Typography"
//                                 >
//                                     Styles for headings, paragraphs, lists...etc
//                                 </ListItem>
//                             </ul>
//                         </NavigationMenuContent>
//                     </NavigationMenuItem>
//                     <NavigationMenuItem>
//                         <NavigationMenuTrigger
//                             onClick={() => setPath('#pricing')}
//                             className={cn({
//                                 'dark:text-white': path === '#pricing',
//                                 'dark:text-white/40': path !== '#pricing',
//                                 'font-normal': true,
//                                 'text-xl': true,
//                             })}
//                         >
//                             Pricing
//                         </NavigationMenuTrigger>
//                         <NavigationMenuContent>
//                             <ul className="grid w-[400px] gap-3 p-4  md:grid-row-2  ">
//                                 <ListItem
//                                     title="Pro Plan"
//                                     href={'#'}
//                                 >
//                                     Unlock full power with collaboration.
//                                 </ListItem>
//                                 <ListItem
//                                     title={'free Plan'}
//                                     href={'#'}
//                                 >
//                                     Great for teams just starting out.
//                                 </ListItem>
//                             </ul>
//                         </NavigationMenuContent>
//                     </NavigationMenuItem>
//                     <NavigationMenuItem>
//                         <NavigationMenuContent>
//                             <ul
//                                 className="grid w-[400px]
//             gap-3
//             p-4
//             md:w-[500px]
//             md:grid-cols-2
//             lg:w-[600px]
//             "
//                             >
//                                 {components.map((component) => (
//                                     <ListItem
//                                         key={component.title}
//                                         title={component.title}
//                                         href={component.href}
//                                     >
//                                         {component.description}
//                                     </ListItem>
//                                 ))}
//                             </ul>
//                         </NavigationMenuContent>
//                     </NavigationMenuItem>
//                     <NavigationMenuItem>
//                         <NavigationMenuLink
//                             className={cn(navigationMenuTriggerStyle(), {
//                                 'dark:text-white': path === '#testimonials',
//                                 'dark:text-white/40': path !== '#testimonials',
//                                 'font-normal': true,
//                                 'text-xl': true,
//                             })}
//                         >
//                             Testimonial
//                         </NavigationMenuLink>
//                     </NavigationMenuItem>
//                 </NavigationMenuList>
//             </NavigationMenu>
//         </>
//     );
// }
