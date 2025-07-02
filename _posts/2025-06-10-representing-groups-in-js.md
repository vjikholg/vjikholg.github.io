---
title: Representing Finite Groups in Javascript
date: 2025-06-10 08:46:00 +0800
categories: [Math, Computational Algebra]
tags: [group-theory]      # TAG names should always be lowercase
math: true
description: Finite-Field.js development journal.
---
# Table of contents
1. [Introduction](#introduction)
2. [Words](#words)
3. [Algorithmic Closure Enforcement](#algorithmic-closure-enforcement)
    1. [Graph Theoretic Approach](#graph-theoretic-approach)
    2. [Group Theoretic Approach](#group-theoretic-approach) 
4. [Group Construction Algorithm](#group-construction-algorithm)

# Introduction 
While on the surface it seems like there are *not* that many reasons to represent finite groups in code, Hulpke (2010) lists some reasons that we might actually be interested in representing these objects: 

1. Interest in developing algorithms and verifying properties of concretely defined finite groups - given group $$G$$, algorithms that might let us verify certain properties, find specific subgroups like the center $$Z(G)$$ (all commutative elements of $$G$$) or given $$S \subset G$$, the normal closure $$N(S) < G$$ - the smallest subgroup of $$G$$ which contains $$S$$. 
    - What *exactly* do these group elements look like? Are they permutations like those in $$S_n$$, Matrices like $$GL(n)$$, or are they slightly more exotic like points on an Elliptic Curves over Finite Fields and their group law? How would we represent these objects and their binary operation in data? 
    - If we're given two identical groups represented in two different ways, how can we determine if they're isomorphic  
2. Complexity Theory - Graph Isomorphism is a prime example - fundamentally we're just trying to figure out if two graphs given their adjacency matrix are isomorphic and so the problem reduces down to permutations of vertices, or row and column operations on our adjacency matrix, and thus maybe if we research techniques and algorithms on Permutation groups and their objects, that we might find useful things to help us determine these things. 

There are many reasons why, so we'll not focus on the *why* but rather *how*. Computational Algebra Systems like GAP natively support finite groups and permutations using Schreier's Lemma, but in our use case (Cayley Graphs) its sufficient to use the naive implementation using **Matrices over Finite Fields**. Indeed, [GroupNames](https://people.maths.bris.ac.uk/~matyd/GroupNames/) keeps a database of properties for every finite group up to order 500 in Matrix form, including their generators. Here are the components that we need: 

1. Represent Matrices over Finite Fields. This can be done as an extension of `math.js`'s native Matrix library, in my case I just programmed my own as an exercise. For example, we'll need something like this: 

    ```js 
    /**
    * Represents a matrix over finite field. 
    * @constructor
    * @param {Number} order of our GLF   
    * @param {Number} row 
    * @param {Number} column
    */
    export class Matrix { 
        constructor(order, m, n) { 
            this.glf = order;                             // since what we're representing is a matrix over finite field - add, mult, etc., are all over a glf
            this.rows = m;                                // mult, add, inversion will call this.glf when doing performing modulo mod (glf) 
            this.cols = n || m; 
            this.contents = new Array(m); 
            for (let i = 0; i < m; i++) {
                this.contents[i] = new Array(this.cols).fill(0); // this part is purely optional, I did this to avoid weird undefined situations.
            }
        }
    
        //...
    }
    ```
We'll need things like Matrix Multiplication, Comparison, and Inversion (which will be done as an exercise to the reader). Its important to note its not plug and play from `math.js`, multiplication and inversion will be done over finite fields, and when you consider it, comparison of two matrices is at worst `O(mn)`. Thankfully, groups up to order 500 don't have ridiculous matrix dimensions (typically $$m, n\leq 10 $$) so naive comparison either through hashing matrix values by flattening our array and converting to a string, or two for-loops with element comparison is sufficient. 

2. Next we'll actually need some sort of data structure to hold all these matrices we're about to generate. We could wrap a `Group` name over `set`, which would be simple enough, but first we need to consider exactly *how* we generate our group. In groups of order thousands in magnitude, its far better to implement the [Shreier-Sims algorithm](https://en.wikipedia.org/wiki/Schreier%E2%80%93Sims_algorithm), which is an algorithm capable of both determining order of a permutation group given its generators, on top of the permutation group itself. However, for now we're primarily concerned with groups of order $$\leq 500$$ (since this is the easiest available data), so lets "intuition" our way to a very natural simple algorithm that we can quickly implement as a proof of concept. 

# Words
Formally, words of a set $$S = \{g_1, g_2,...,g_n\}$$ are defined as a string: 

$$\begin{equation} w = g_1 g_2 ... g_k ; 1 \leq k \leq n \end{equation}$$

If we endow the set of all **words** $$E$$ of $$S$$ with the binary operation **string concatenation**, then $$E$$ is a **monoid** over $$S$$. 

- Thus, what does "generated by set $$S = \{g_1, g_2,...\}$$" really mean? In short, we want to generate the set of all words $$E$$ which contains all words of the form:
$$\begin{equation} \prod g_{k_j}^{\epsilon_j} = g_{k_1}^{\epsilon_1} g_{k_2}^{\epsilon_2} ... \end{equation}$$ 
And reduce them - but this is an exponential algorithm so it's not great in practice. It suggests two properties we need to achieve for this new set of words $$E$$ we're generating from $$S$$ 
     - Because the empty word is a valid word (setting $$k_j = 0$$ for all $$j$$), its clear $$1 \in E$$. In any algorithm, this is free since we can just add the identity element to our generating set. 
     - If $$E$$ contains all words, it must also contain the concatenation of all words and thus must be closed under our binary operation (concatenation) - thus anything we generate from $$S$$ needs to be **closed**

Anyways, the key takeaway is words and group elements are basically interchangeable, its just a matter of reduction and representation, so we'll use whichever one is most convenient to describe exactly what we're doing. 
# Algorithmic Closure Enforcement 
We can tackle this in two different ways - either using a graph or group theoretic framework. I'll demonstrate both: 

## Graph Theoretic Approach
Consider **Graph Reachability** - If for every unique group element (or reduced word) we assign a node and every edge "links" two elements together if obtainable by right-multiplication by another element, then starting at the identity and following the element-labeled edge is exactly the group $$\left< S \right> \leq G$$. Thus, inserting the identity element $$1_G$$ and $$S$$ into a queue $$Q$$, we can use a pseudo-**BFS** algorithm (starting at $$i = 0$$): 
1. Select the $$i$$th element (or node), $$Q[i] = x$$.
2. For each element $$g \in Q$$, push $$xg\rightarrow Q \iff xg \not \in Q$$, (including any "newly" discovered elements).
3. Let $$i = i+1$$  

Why do we include each element discovered so far, why not just generators? When you first visit a new element, there's no indication what product it may form with earlier ones so its necessary to revisit it once you have the current list, especially given the closedness axiom of a group $$G$$. It is exactly the case that generating our "Group" object needs some sort of queue with indexed access and fast membership testing. Ideally, setting up a `Set` iterator lets us do this exactly, but `Set` doesn't handle object-comparison well. My solution in this case was to construct a new data structure, `IndexedSet`, an `Array` and `Map<String, int>` kept in parallel where `Array` kept the actual group elements while `Map` is used for fast membership testing by mapping a flattened matrix into their index position in `Array`. 

You can view my implementation [here](https://github.com/vjikholg/finite-field/blob/main/modules/structs/indexedset.js).

## Group Theoretic Approach 
We want to build a grounds-up approach towards constructing a set that contains all combination of words. Given any subset $$X \subset G$$ define the operator:

$$\begin{equation} C(X) = \{1\} \cup \{x^{-1} | x \in X \} \cup \{xy | x,y \in X\} \end{equation}$$

If $$1_G \in X$$ then clearly $$C(X)$$ then $$X \subseteq C(X)$$. If we assume $$1_G \in S$$ then $$C(S)$$: 

$$\begin{equation} C(S) = \{1, g_1, g_2,..., g_1^{-1},..., g_1g_2, g_1g_3,..., g_{n-1}g_n\}\end{equation}$$

In that sense, $$C(S)$$ is the list of all 0-2 length letter words, or all group elements built with at most 2 non-unique generators. Calling $$C$$ twice: 

$$\begin{equation} C(C(S)) = \{1,g_1, g_2,...,g_1^{-1},...,g_1g_2,...,g_1g_2g_3,...,g_1g_2g_3g_4,... \}\end{equation}$$

So $$C(C(S))$$ is the set of all 0-4 length letter words before reduction, or all group elements built with at most 4 non-unique generators. In this same line of logic $$C^3(S)$$ would the the set of all length 0-16 words, up to $$C^{n}(S)$$ which contains words between 0-$$2^{2^{n-1}}$$ (from $$n=1$$) long words, etc. What use is all of this? Here's the interesting line of logic: 

1. Let $$\mathcal{P}(G)$$ be the powerset of elements in group $$G$$
2. For $$X, Y \in \mathcal{P}(G)$$, let $$X \leq Y \iff X \subseteq Y$$
3. Then $$(\mathcal{P}(G), \leq)$$ is a partially-ordered set (poset)
4. Notice that 

    $$\begin{equation} S \subseteq C(S) \subseteq C(C(S)) \subseteq ... \subseteq C^{n}(S)\end{equation}$$

5. Every time $$C$$ is applied either we find new words or we don't, i.e., either $$C^k(S) \subset C^{k+1}(S)$$ (meaning we have found new words) or $$C^k(S) = C^{k+1}(S)$$ (no new words are found). 
Thus because $$|G| \leq \infty$$ it must be the case $$\exists n \forall k$$, $$k > n \implies \quad C^k(S) = C^{k+1}(S)$$, else $$C^k(S)$$ grows infinitely - which is impossible, as there are only finitely many elements in $$G$$

Upon reduction its clear $$C^k(S)\in \mathcal{P}(G)$$ for $$k>0$$ and so $$C(S) \leq C^{2}(S) \leq ...$$ forms an [***Ascending Chain*** ](https://en.wikipedia.org/wiki/Ascending_chain_condition). Thus it remains that we construct an algorithm which exactly follows operator $$C$$ on a given set of generators $$S$$. If we assume we're working on generating set $$S$$ its clear: 

1. Push $$1_G \rightarrow S$$ (we know the dimension and order of our matrix representation)
2. For each $$x\in S$$: 
    1. Push $$x^{-1} \rightarrow S \iff x^{-1} \not \in S$$
    2. For each $$y \in S$$: 
        1. Push $$xy \rightarrow S \iff xy \not \in S$$ 

From here, we'd recursively call an algorithm of this style on itself up until we notice invariance. 
# Group Construction Algorithm
```js
    export class FiniteGroup {
    /**
     * Represents a finite group. Uses matrices over GL(p^k) as elements.  
     * @constructor
     * @param {Array} generators matrix(ces) over GLFs  
     * @param {Number} name of our group
     */
    constructor(generator, name) { 
        this.name = name; 
        this.elems = new indexedSet() // Indexed Access + O(1) membership checking as long as we hash matrices
        this.elems.set(generator); // pushes array of gens -> indexedSet
        // keeps initial length of elems - keep index of generators rather than generators themselves
        this.generators = [];
        for (let i = 0; i < generator.length; i++) {
            this.generators.push(i); 
        }
            this.makeGroup(); 
            this.order = this.elems.size; 
        }

    makeGroup() {                             
        let i = 0; 
        while (i < this.elems.size) {        // want size to update at the start of each loop
            let curr = this.elems.get(i); 
                this.elems.forEach( (g) => {    
                    let newElem = curr.mult(g); 
                    if (!this.contains(newElem)) {
                        this.elems.add(newElem);
                        } 
                    })
                    i++; 
                }
            }
    }
```

# Remarks 
One of the big takeaways for me designing this representation was determining what or which algorithm *actually* works when constructing when building the Finite Group before I landed on a concrete data structure. I had initially settled on an array before realizing I needed membership testing, swapped to `Set` before realizing I needed indexed access as well. This ultimately led me to build `IndexedSet` which perfectly suited my use case. 