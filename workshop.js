let coaching = [

    ["Select a prompt from the drop down",
    "Partner Prompt",
    "Coach Prompt"],
        
    ["Coaching on a new Opportunity",
    "Partner - You are considering applying for a promotion (or a new role), but you are not confident in your abilities as this will be a significant change in responsibility, team dynamics, or technology, etc... The coach is a friend of yours, and the coach initiates conversation",
    "Coach - You start a conversation with a friend/peer about work 'how are things at work' and they seem to be struggling with something. Ask some open ended questions to discover what's going on, identify some of the key issues, and then help them identify a path forward"],

    ["Challenging Teammate",
    "Partner - You have a teammate who is hard to work with because they [don't deliver, are rude, communicate ineffectively, get distracted with unimportant work] and you're sick of it. You are about to have a 1:1 with your manager. (Unspoken context - You have not tried to address the issue with the challenging teammate)",
    "Coach - You are a manager and are having a 1:1 with your teammate. You ask how their current project is going but pickup on some underlying struggle. Help your teammate move from venting into understanding the issue and moving towards action."],

    
    ["Perceived Favoritism",
    "Partner - You are frustrated because your tech lead/manager on your product team always picks another teammate for tasks you would like to be assigned. (Unspoken subtext, this other person is actually the most qualified, but you're struggling with how to grow technically)",
    "Coach - You are having a chat with a teammate/peer and they seem unhappy, ask an opening question and see where the conversation takes you !!! ADD OUTLINE OF COACHING PROCESS !!! "],

    ["Divergence from Practices",
    "Partner - You are working with a challenging client and are feeling some pressure to deliver. This has caused you to take some shortcuts that might not align with labs practices (e.g. sustainable pace, not pairing, etc...). If possible, use an example from your professional realm to make the dialog more realistic!",
    "Coach - You have noticed one of your teammates/peers on an engagement isn't quite delivering in the way we operate at Labs, you are concerned and want to discuss more. Start with an open ended question about the engagement, then explore some of the issues before creating a path to action."],

    ["Ignoring user Research",
    "Partner - You have strong opinions on which features are most important for the product, however recent user interviews don't agree. You want to push those user requests to the next iteration and work on your personal priority first",
    "Coach - You noticed one of your teammates seems to be diverging from what the team discovered in the most recent batch of user interviews. Ask an opening question, and then spend some effort to discover the crux of the issue and then find a way to get back on track."],


    ["Challenging Technical Issue (Stuck)",
    "You are dealing with a challenging technical issue (use something relevant to your field) and feel stuck. You need someone to help you explore other options. You are about to sit down with your tech lead or manager to have a discussion.",
    "You are a manager or tech lead and are about to have an informal chat with one of your teammates on your project. Ask an opening question and see where things take you."],

    ["Don't like a new role",
    "You have started a new job/role but you \"don't like it\" and are worried you made a bad choice. (Subtext: You are really struggling to figure out how to succeed, you don't know how to ask for help) ",
    "You are talking with a teammate/peer about a new role they have started. Open the dialog to see how things are going and help discover any underlying issues. For key issues help your teammate discover a path forward."],

    ["Need help convincing stakeholder",
    "You re working with a difficult client or teammate who is struggling with how to interact with the team. They don't seem interested in our practices or our team norms. Use your coach to help you talk throuhg the problem and come up with  ",
    "You are talking with a teammate/peer when they mention that they are having a hard time at work. Ask an opening question about how work is going, do some discovery around their issue, and help them come up with some specific ways to proceed"]

];


function getRandom()
{

    randomOpt = Math.ceil(Math.random() * (coaching.length-1))
    document.getElementById("selectNumber").value = randomOpt;
   
    updateWorkshop();

}

function updateWorkshop()
{
    
    
    var currentSelect = document.getElementById("selectNumber").value;

    var visSelect = document.getElementById("selectVis").value;


    if(visSelect & 1)
    {
        document.getElementById("partnerPrompt").innerHTML = coaching[currentSelect][1];
    }
    else
    {
        document.getElementById("partnerPrompt").innerHTML = "";

    }

    if(visSelect & 2)
    {

        document.getElementById("coachPrompt").innerHTML = coaching[currentSelect][2];
    }
    else
    {
        document.getElementById("coachPrompt").innerHTML = "";

    }

}

function popOptions()
{
    var select = document.getElementById("selectNumber");
    
    
    for(var i = 0; i < coaching.length; i++) {
        
        var el = document.createElement("option");
        el.textContent = i + " - " + coaching[i][0];
        el.value = i;
        select.appendChild(el);
    }

    updateWorkshop()

}
