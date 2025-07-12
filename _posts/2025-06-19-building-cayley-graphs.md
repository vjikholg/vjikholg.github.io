---
title: Building Cayley Graphs
date: 2025-06-10 08:46:00 +0800
categories: [Math, Computational Algebra, Group Theory]
tags: [group-theory, graph-theory]      # TAG names should always be lowercase
math: true
description: Development journal of cayley-grapher 
---
# Introduction 
Abstract Group Theory is typically taught in such a way that examples are treated as an afterthought - yet, one of the first major theorems taught early in Group Theory courses - Cayley's - actually provides the framework towards building something that can help us visualize these groups as concrete algebraic objects without resorting to mind-numbing symbol pushing. In this post we'll walk from permutations towards Cayley's theorem to a visual recipe for Cayley Graphs, at each step we try to intuitively motivate the next section.  

## Permutations
Let $$S$$ be a set of elements. A bijection (injective/surjective map) $$\sigma: S \rightarrow S$$ from $$S$$ to itself is described as a permutation, so in that sense $$\sigma(S) = S$$. Typically this is used to describe some new arrangement of objects which preserve some form of symmetric. For example if we had ordered list $$L = \{0,1,2,3\}$$, then $$\sigma(x) = x+1 \pmod 4$$ constructs a new ordered list $$\sigma(L) = \{1,2,3,0\}$$. While the order of the numbers themselves are different, the values of the list remains invariant. Another example would be the axis of symmetry on a cube - in particular any symmetry which cuts through points themselves. This tells us that permutations don't necessarily need to "change" points - objects can be fixed to themselves, in case it wasn't obvious that the identity map $$\sigma_1: S \rightarrow S$$ such that any given $$x \in S$$ we have $$\sigma_1(x) = x$$ is a permutation itself. 
 
# Cayley's Idea
One of the first things usually glanced over is teaching the notion of a group in terms of rotational and mirroring operations on a set of points, used extensively in Physics and Chemistry [(Point Groups)](https://en.wikipedia.org/wiki/Point_group). Fundamentally they simply describe a set of operations performed on these points which preserve the initial symmetry of a geometric object - whether that be a flag, organic molecule, etc., any object which contains *some* notion of symmetry *can* usually describe a point group. Its safe to say that these are exactly the permutation's we mentioned earlier - some type of transform which preserves symmetry upon an object. Cayley's Theorem somewhat capitalizes on this - treating elements in these finite groups as the "points" themselves and simply states instead of rotations or mirror operations, if we consider the image group operation per element, that these groups can be interpreted as sets of permuitations, in particular subgroups of $S_{|G|}$. 

## Theorem 1. Cayley's Theorem
Let $$G$$ be a group with $$|G| = n$$. For any given $$g \in G$$, let $$l_g: G \rightarrow G$$ be the left multiplication map by $$g$$ - i.e., $$l_g(x) = gx$$. Furthermore let $$\varphi: G \rightarrow \text{Sym}(G)$$ be defined by $$\varphi(g) = l_g$$.
1. $$\varphi$$ is injective.
2. $$\varphi$$ is a homomorphism.

### Proof Outline
Pick any arbitrary element $$g \in G$$ and consider how it behaves as a left multiplication action. Then, consider its map $$\varphi: G \rightarrow S_{n}$$ and determine its properties. It shouldn't be too bad showing its homomorphic and injective properties, and from there you can either directly show the subgroup in $$S_{n}$$ or use [**Homomorphic Image of a Group is a Group**](https://planetmath.org/homomorphicimageofgroup)

### Example
Consider $$\mathbb{Z} / 5 \mathbb{Z} = \{0,1,2,3,4\} $$ and consider left addition by 1 - this is okay, since Cayley's theorem doesn't specify *exactly* what left multiplication is. $$\mathbb{Z} / 5 \mathbb{Z}$$ is an additive group on 5 elements.

 This takes:
1. $$ 0 \rightarrow 1 $$ 
2. $$ 1 \rightarrow 2 $$ 
3. $$ 2 \rightarrow 3 $$ 
4. $$ 3 \rightarrow 4 $$
5. $$ 4 \rightarrow 0 $$ 

Thus, $$\varphi(1) = (01234)$$, we can repeat the same operations on 2,3, 4 and 0 to find that $$\varphi(2) = (13024)$$, $$\varphi(3) = (14201)$$,  $$\varphi(4) = (10432)$$ and $$\varphi(0) = (1)(2)(3)(4)(0) = 1_{S_5}$$. Its clear: 

$$ \begin{equation} \varphi(\mathbb{Z} / 5 \mathbb{Z}) = \{1_{S_5}, (01234), (13024), (14201) , (10432)\} < S_5\end{equation} $$

## Cayley Graphs
Lets try to motivate Cayley Graphs without relying too much on the definition. In my previous post, I demonstrated group generation is analogous to a BFS algorithm where in order to assert closedness while generating our groups, we simply multiply a "current" element with all "discovered" element. In that sense, group generation and consequently, finite groups themselves have a fairly obvious "graph representation" - for each $$g_i, g_j \in G$$, we have $i, j \in V$ and if there exists $h \in G$ such that $hg_i  = g_j$, then we have directed edge $(i,j) \in E$. This gives us a sort of basis towards connecting Group and Graph theory - but its way too messy! At worst, each node would have $|G| - 1$ edges - the node associated with $1_G$ would be exactly this case. 

There is a fairly obvious solution though! Remember, finitely generated groups are exactly that: each element $g \in \left< S \right>$ is simply a composition of generators $s_1, s_2,...,s_n \in S$. What this mean is restricting edge-connectivity to simply checking where each element "goes" when multiplied with generators is sufficient enough to generate a connected digraph. Thus, an overview of the pseudocode should look something like: Given generating set $S$ and group $G = \left< S\right>$, with Graph $\mathcal{G} = (V,E)$:  
1. For each $g \in G$, push $g\in V$ and find $$gS = \{ gs_1, gs_2,..., gs_n \}$$ 
2. for each $gs \in gS$, we have a directed edge $$(g,gs) \in E$$

Here's a code snippet demonstrating what I've done basically - utilizing my FiniteField library and 3d-force-graph, it takes a group object and outputs graphing information onto 3d-force-graph: 
```javascript
    update(group) {
        const key2idx = new Map();
        let nodes = []; 
        // caching elements so we can map node/key -> element id. 
        // building node list while we're at it
        for (const [i, el] of group.elems.entries()) {
            nodes.push({id: i, label: el.key, value: 4}) // value -> size of node
            key2idx.set(el.key, i);
        }

        // console.log(nodes);
        
        // building link list
        // for each element, mult elem with generator, check target 
        let links = []; 

        for (const g of group.elems) {
            for (let h of group.generators) {           // group generators kept as indices inside list
                let temp = g.mult(group.elems.get(h));  // g*s1, g*s2, etc.,  
                links.push({                            // push node + edge into vertex/edge sets 
                    source: key2idx.get(g.key), 
                    target: key2idx.get(temp.key) 
                })
            }
        }
        this.graph.graphData({nodes,links});
    }
```
Below is an sample - A Cayley Graph of the Finite Group $C_2^2 \times C_4$ Abelian group of type $\[2,2,4\]$ - I picked this one because at a certain angles it looks like the 3D-projection of a 4D-hypercube: 
{% include force-graph.html id="cayley" %}

# Conclusion 
Basically permutations motivate a way for us to think about rearranging objects while preserving some overlying structure which motivates us to think of a way to permute groups - this leads us to Cayley's theorem which gives the method - a naive method - to visualize concrete group structures as permutations, from which we can "prune" down the unnecessary edges to construct very nice algebraic shapes. Its possible to use these diagrams to visualize group-theoretic theorems which is actually what Nathan Carter does in his textbook ["Visual Group Theory"](https://web.osu.cz/~Zusmanovich/teach/books/visual-group-theory.pdf). One example we have is demonstrating Lagrange Theorems - from the node representing the identity element, we can colour the paths by their generators and follow them - this lets us see the embedded Cyclic subgroups within overarching group.  

 

